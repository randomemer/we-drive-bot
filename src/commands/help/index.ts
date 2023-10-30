import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View information about available commands"),
  async callback(interaction) {},
} satisfies BotCommandRoot;
