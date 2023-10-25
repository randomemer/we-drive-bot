import { SlashCommandBuilder } from "discord.js";

import defaultCommand from "./default";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Server management commands"),
  subCommands: new Map([[defaultCommand.data.name, defaultCommand]]),
};

command.data.addSubcommand(defaultCommand.data);

export default command;
