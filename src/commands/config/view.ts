import SubCommand from "@/modules/commands/sub-command";
import { GuildModelJoined } from "@/modules/db/models/guild";
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
    const guildModel = context.get("guild") as GuildModelJoined;
    const embed = defaultEmbed()
      .setTitle("⚙ Server Config")
      .setTimestamp(new Date());

    const desc = [
      `- ${bold("Minecraft Server Id")} : ${inlineCode(
        guildModel.mc_server ?? "nil"
      )}`,
      `- ${bold("Minecraft Updates Channel")} : ${
        guildModel.mc_channel
          ? channelMention(guildModel.mc_channel)
          : inlineCode("nil")
      }`,
      `- ${bold("Minecraft Role")} : ${
        guildModel.mc_role ? roleMention(guildModel.mc_role) : inlineCode("nil")
      }`,
      `- ${bold("Backup Schedule")} : ${inlineCode(
        guildModel.minecraft_server?.backup_cron ?? "nil"
      )}`,
    ];

    embed.setDescription(desc.join("\n"));

    await interaction.editReply({ embeds: [embed] });
  },
});
