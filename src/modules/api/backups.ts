import { Client } from "discord.js";
import cron, { ScheduledTask } from "node-cron";

export default class BackupManager {
  client: Client;
  guildId: string;

  scheduledTask: ScheduledTask;

  // static createBackups() {
  //   cron.schedule("");
  // }

  constructor(client: Client, guildId: string) {
    this.client = client;
    this.guildId = guildId;
  }

  create() {}

  delete() {}
}
