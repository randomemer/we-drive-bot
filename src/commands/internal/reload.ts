import { SlashCommandSubcommandBuilder } from "discord.js";

const reloadCommand: BotSubcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("reload")
    .setDescription("Reload all slash commands or a specific one"),
  async callback(interaction) {},
};

export default reloadCommand;
