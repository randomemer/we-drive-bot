import { SlashCommandBuilder } from "discord.js";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Server management commands"),
};

export default command;
