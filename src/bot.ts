import { Client, ClientOptions } from "discord.js";

export default class WeDriveClient extends Client {
  constructor(options: ClientOptions) {
    super(options);
  }

  async registerSlashCommands() {}

  async registerEventListeners() {}
}
