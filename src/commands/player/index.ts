import { SlashCommandBuilder } from "discord.js";
import createCommand from "./create";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("player")
    .setDescription("Commands concerning a player"),
  subCommands: new Map([[createCommand.data.name, createCommand]]),
};

command.data.addSubcommand(createCommand.data);

export default command;
