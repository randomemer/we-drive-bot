import { CommandType } from "@/types";
import { SlashCommandSubcommandBuilder } from "discord.js";

export default {
  type: CommandType.SubCmd,
  data: new SlashCommandSubcommandBuilder()
    .setName("reload")
    .setDescription("Reload all slash commands or a specific one"),
  async callback(interaction) {},
} satisfies Subcommand;
