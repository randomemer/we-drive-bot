import { Client, ClientEvents, ClientOptions, REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { DEV_GUILD_ID } from "./modules/utils/constants";
import logger from "./modules/utils/logger";

export default class WeDriveClient extends Client {
  slashCommands = new Map<string, RootCommand>();

  constructor(options: ClientOptions) {
    super(options);
  }

  async registerSlashCommands(): Promise<void> {
    const appId = process.env.BOT_APP_ID!;
    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);

    // 1. Read files and get all commands
    const folderContents = fs.readdirSync(path.join(__dirname, "commands"));
    const globalCmds: any[] = [];
    const devCmds: any[] = [];

    for (const item of folderContents) {
      const commandPath = path.join(__dirname, "commands", item);
      const command: RootCommand = require(commandPath).default;

      if (process.env.NODE_ENV === "prod" && command.dev) {
        globalCmds.push(command.data.toJSON());
      } else {
        devCmds.push(command.data.toJSON());
      }

      this.slashCommands.set(command.data.name, command);
    }

    // 2. Deploy globals commands separately

    if (process.env.NODE_ENV === "prod") {
      logger.info(`Deploying ${globalCmds.length} application (/) commands`);

      await rest.put(Routes.applicationCommands(appId), { body: globalCmds });

      logger.info(
        `Sucessfully deployed ${globalCmds.length} application (/) commands\n`
      );
    }

    // 3. Deploy development guild commands
    logger.info(`Deploying ${devCmds.length} dev (/) commands`);

    await rest.put(Routes.applicationGuildCommands(appId, DEV_GUILD_ID), {
      body: devCmds,
    });

    logger.info(`Sucessfully deployed ${devCmds.length} dev (/) commands\n`);
  }

  async registerEventListeners(): Promise<void> {
    let files = fs.readdirSync(path.join(__dirname, "events"));

    for (const file of files) {
      const filePath = path.join(__dirname, "events", file);
      const listener: ListenerConfig<keyof ClientEvents> =
        require(filePath).default;

      this.on(listener.name, listener.listener);
    }

    logger.info(`Registered ${files.length} event listeners`);
  }
}
