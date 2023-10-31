import SubCommand from "@/modules/commands/sub-command";
import { SlashCommandSubcommandBuilder } from "discord.js";

export default new SubCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("reload")
    .setDescription("Reload all slash commands or a specific one"),
  async callback(interaction) {},
});
