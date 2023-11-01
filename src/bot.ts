import {
  Client,
  ClientEvents,
  ClientOptions,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import logger from "./modules/utils/logger";
import { DEV_GUILD_ID } from "./modules/utils/constants";

export default class WeDriveClient extends Client {
  slashCommands = new Map<string, RootCommand>();

  constructor(options: ClientOptions) {
    super(options);
  }

  async registerSlashCommands(): Promise<void> {
    const folderContents = fs.readdirSync(path.join(__dirname, "commands"));
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    for (const item of folderContents) {
      const commandPath = path.join(__dirname, "commands", item);
      const command: RootCommand = require(commandPath).default;

      commands.push(command.data.toJSON());
      this.slashCommands.set(command.data.name, command);
    }

    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);

    logger.info(`Deploying ${commands.length} application (/) commands`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.BOT_APP_ID!, DEV_GUILD_ID),
      { body: commands }
    );

    logger.info(
      `Sucessfully deployed ${commands.length} application (/) commands\n`
    );
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
