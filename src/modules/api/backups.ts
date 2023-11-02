import ServerModel from "@/modules/db/models/server";
import { MAX_BACKUPS } from "@/modules/utils/constants";
import { defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import dayjs from "dayjs";
import { Channel, Client } from "discord.js";
import _ from "lodash";
import cron, { ScheduledTask } from "node-cron";
import pterodactyl from ".";

export default class BackupManager {
  client: Client;
  server: ServerModel;
  scheduledTask: ScheduledTask;
  channel?: Channel | null;

  static managers = new Map<string, BackupManager>();

  static async createSchedules(client: Client) {
    const servers = await ServerModel.query()
      .whereNotNull("mc_server")
      .whereNotNull("backup_cron");

    servers.forEach((srv) => {
      const manager = new BackupManager(client, srv);
      this.managers.set(srv.id, manager);
    });

    logger.info(`Created ${this.managers.size} backup managers`);
  }

  static stopSchedules() {
    this.managers.forEach((manager, key) => {
      manager.scheduledTask?.stop();
      this.managers.delete(key);
    });
  }

  constructor(client: Client, server: ServerModel) {
    this.client = client;
    this.server = server;

    this.init();
    logger.info(`(${this.server.id}) Created backup manager `);
  }

  init() {
    this.scheduledTask = cron.schedule(
      this.server.backup_cron!,
      this.backup.bind(this),
      { runOnInit: false, timezone: "Etc/UTC" }
    );

    if (this.server.mc_channel) {
      this.client.channels
        .fetch(this.server.mc_channel)
        .then((channel) => {
          this.channel = channel;
        })
        .catch((err) =>
          logger.error(
            err,
            `(${this.server.id}) Failed to fetch channel for backup manager`
          )
        );
    }
  }

  // Cycles backups, deleting out of date one to stay under limit
  async backup() {
    logger.info(`(${this.server.id}) Starting backup`);
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
      `servers/${this.server.mc_server}/backups`
    );
    return resp.data.data;
  }

  // Creates a backup
  async create(): Promise<Backup> {
    const resp = await pterodactyl.post<Backup>(
      `servers/${this.server.mc_server}/backups`
    );
    return resp.data;
  }

  // Deletes a specific backup
  async delete(id: string): Promise<void> {
    await pterodactyl.delete(`servers/${this.server.mc_server}/backups/${id}`);
  }

  // Message helpers

  sendStartMessage() {
    if (!this.channel) return;
    if (!this.channel.isTextBased()) return;

    this.channel
      .send({ content: "🔁 Starting Backup Process" })
      .catch((err) =>
        logger.error(
          err,
          `(${this.server.id}) Failed to send backup started message`
        )
      );
  }

  sendBackupDeleteMessage(backup: Backup) {
    if (!this.channel) return;
    if (!this.channel.isTextBased()) return;

    const embed = defaultEmbed()
      .setTitle("🗑️ Old Backup Deleted")
      .addFields(
        { name: "Id", value: backup.attributes.uuid },
        { name: "Name", value: backup.attributes.name }
      )
      .setTimestamp(new Date(backup.attributes.created_at));

    this.channel
      .send({ embeds: [embed] })
      .catch((err) =>
        logger.error(
          err,
          `(${this.server.id}) Failed to send backup deleted message`
        )
      );
  }

  sendBackupSuccessMessage(backup: Backup) {
    if (!this.channel) return;
    if (!this.channel.isTextBased()) return;

    const embed = defaultEmbed()
      .setTitle("✅ Created New Backup")
      .addFields(
        { name: "Id", value: backup.attributes.uuid },
        { name: "Name", value: backup.attributes.name }
      )
      .setTimestamp(new Date(backup.attributes.created_at));

    this.channel
      .send({ embeds: [embed] })
      .catch((err) =>
        logger.error(
          err,
          `(${this.server.id}) Failed to send backup sucess message`
        )
      );
  }
}
