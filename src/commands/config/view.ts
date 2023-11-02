import SubCommand from "@/modules/commands/sub-command";
import ServerModel from "@/modules/db/models/server";
import { defaultEmbed } from "@/modules/utils/functions";
import {
  SlashCommandSubcommandBuilder,
  bold,
  channelMention,
  inlineCode,
  roleMention,
} from "discord.js";

export default new SubCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("view")
    .setDescription("View your current configuration"),
  async callback(interaction, context) {
    const server = context.get("server") as ServerModel;
    const embed = defaultEmbed()
      .setTitle("⚙ Server Config")
      .setTimestamp(new Date());

    const desc = [
      `- ${bold("Minecraft Server Id")} : ${inlineCode(
        server.mc_server ?? "nil"
      )}`,
      `- ${bold("Minecraft Updates Channel")} : ${
        server.mc_channel
          ? channelMention(server.mc_channel)
          : inlineCode("nil")
      }`,
      `- ${bold("Minecraft Role")} : ${
        server.mc_role ? roleMention(server.mc_role) : inlineCode("nil")
      }`,
      `- ${bold("Backup Schedule")} : ${inlineCode(
        server.backup_cron ?? "nil"
      )}`,
    ];

    embed.setDescription(desc.join("\n"));

    await interaction.editReply({ embeds: [embed] });
  },
});
