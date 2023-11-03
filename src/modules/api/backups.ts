import { GuildModel, ServerModel } from "@/modules/db";
import { MAX_BACKUPS } from "@/modules/utils/constants";
import { defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import dayjs from "dayjs";
import { Client } from "discord.js";
import _ from "lodash";
import cron, { ScheduledTask } from "node-cron";
import pterodactyl from ".";
import { ServerObject } from "../db/models/server";

export default class BackupManager {
  static managers = new Map<string, BackupManager>();

  static async createSchedules(client: Client) {
    const servers = await ServerModel.query().whereNotNull("backup_cron");

    servers.forEach((srv) => {
      new BackupManager(client, srv);
    });

    logger.info(`Created ${this.managers.size} backup managers`);
  }

  static async updateSchedule(
    serverId: string,
    updated: Partial<ServerObject>
  ) {
    const manager = this.managers.get(serverId);
    if (!manager) return;
    const { server } = manager;

    // Handle cron schedule change
    if (server.backup_cron !== updated.backup_cron) {
      server.backup_cron = updated.backup_cron ?? null;

      if (server.backup_cron) {
        manager.scheduledTask.stop();
        manager.scheduledTask = cron.schedule(
          server.backup_cron,
          manager.backup.bind(manager),
          {
            runOnInit: false,
            timezone: "Etc/UTC",
          }
        );
      }
    }
  }

  static stopSchedules() {
    this.managers.forEach((manager) => {
      manager.cleanup();
    });
  }

  client: Client;
  server: ServerModel;
  scheduledTask: ScheduledTask;

  guilds: GuildModel[] = [];

  constructor(client: Client, server: ServerModel) {
    this.client = client;
    this.server = server;

    this.init();
    BackupManager.managers.set(server.id, this);
    logger.info(`(${this.server.id}) Created backup manager `);
  }

  init() {
    this.scheduledTask = cron.schedule(
      this.server.backup_cron!,
      this.backup.bind(this),
      { runOnInit: false, timezone: "Etc/UTC" }
    );
  }

  // Cycles backups, deleting out of date one to stay under limit
  async backup() {
    logger.info(`(${this.server.id}) Starting backup`);

    // Attempt fetching guilds
    await this.fetchGuilds();
    this.sendStartMessage();

    const backups = await this.list();

    if (backups.length >= MAX_BACKUPS) {
      const oldestBackup = _.minBy(backups, (b) =>
        dayjs(b.attributes.created_at)
      );

      if (oldestBackup) {
        await this.delete(oldestBackup?.attributes.uuid);
        this.sendBackupDeleteMessage(oldestBackup);
      }
    }

    const newBackup = await this.create();
    this.sendBackupSuccessMessage(newBackup);
    logger.info(`(${this.server.id}) Backup completed`);
  }

  async list(): Promise<Backup[]> {
    const resp = await pterodactyl.get<PanelAPIResp<Backup[]>>(
      `servers/${this.server.id}/backups`
    );
    return resp.data.data;
  }

  // Creates a backup
  async create(): Promise<Backup> {
    const resp = await pterodactyl.post<Backup>(
      `servers/${this.server.id}/backups`
    );
    return resp.data;
  }

  // Deletes a specific backup
  async delete(id: string): Promise<void> {
    await pterodactyl.delete(`servers/${this.server.id}/backups/${id}`);
  }

  cleanup() {
    this.scheduledTask?.stop();
    BackupManager.managers.delete(this.server.id);
  }

  // Message helpers

  async fetchGuilds() {
    try {
      this.guilds = await GuildModel.query()
        .where("mc_server", this.server.id)
        .whereNotNull("mc_channel");
    } catch (error) {
      logger.error(`(${this.server.id}) Failed to fetch guilds`);
    }
  }

  async sendStartMessage() {
    try {
      this.guilds.forEach(async (guild) => {
        try {
          const channel = await this.client.channels.fetch(guild.mc_channel!);
          if (!channel || !channel.isTextBased()) return;
          await channel.send({ content: "🔁 Starting Backup Process" });
        } catch (err) {
          const msg = `(${guild.id}) Failed to send backup started message`;
          logger.error(err, msg);
        }
      });
    } catch (error) {
      logger.error(error, `Error occured when sending backup started messages`);
    }
  }

  async sendBackupDeleteMessage(backup: Backup) {
    try {
      const embed = defaultEmbed()
        .setTitle("🗑️ Old Backup Deleted")
        .addFields(
          { name: "Id", value: backup.attributes.uuid },
          { name: "Name", value: backup.attributes.name }
        )
        .setTimestamp(new Date(backup.attributes.created_at));

      this.guilds.forEach(async (guild) => {
        try {
          const channel = await this.client.channels.fetch(guild.mc_channel!);
          if (!channel || !channel.isTextBased()) return;
          await channel.send({ embeds: [embed] });
        } catch (err) {
          const msg = `(${this.server.id}) Failed to send backup deleted message`;
          logger.error(err, msg);
        }
      });
    } catch (error) {
      const msg = `Error occured while sending backup deleted messages`;
      logger.error(error, msg);
    }
  }

  async sendBackupSuccessMessage(backup: Backup) {
    try {
      const embed = defaultEmbed()
        .setTitle("✅ Created New Backup")
        .addFields(
          { name: "Id", value: backup.attributes.uuid },
          { name: "Name", value: backup.attributes.name }
        )
        .setTimestamp(new Date(backup.attributes.created_at));

      this.guilds.forEach(async (guild) => {
        try {
          const channel = await this.client.channels.fetch(guild.mc_channel!);
          if (!channel || !channel.isTextBased()) return;
          await channel.send({ embeds: [embed] });
        } catch (err) {
          const msg = `(${this.server.id}) Failed to send backup sucess message`;
          logger.error(err, msg);
        }
      });
    } catch (error) {
      const msg = `Error occured while sending backup success messages`;
      logger.error(error, msg);
    }
  }
}
