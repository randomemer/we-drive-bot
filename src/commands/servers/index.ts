import { SlashCommandBuilder } from "discord.js";

import listCommand from "./list";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("servers")
    .setDescription("Commands related to servers"),
  subCommands: new Map([[listCommand.data.name, listCommand]]),
};

command.data.addSubcommand(listCommand.data);

export default command;
