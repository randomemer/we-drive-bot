import SubCommand from "@/modules/commands/sub-command";
import ServerModel from "@/modules/db/models/server";
import sendErrorMessage, { AppError } from "@/modules/utils/errors";
import { defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import {
  PermissionFlagsBits,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
  channelMention,
  inlineCode,
} from "discord.js";

export default new SubCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("minecraft_channel")
    .setDescription("Set server channel for this bot's messages")
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName("channel")
        .setDescription("Minecraft Channel")
        .setRequired(true)
    ),

  async callback(interaction, ctx) {
    try {
      const server = ctx.get("server") as ServerModel;
      const channel = interaction.options.getChannel("channel", true);

      const apiChannel = await interaction.guild?.channels.fetch(channel.id);
      if (!apiChannel)
        throw new AppError(undefined, "Unable to configure minecraft channel");

      const perms = apiChannel.permissionsFor(interaction.guild!.members.me!);
      if (!perms.has(PermissionFlagsBits.SendMessages))
        throw new AppError(undefined, "Incorrect channel permissions");

      await server.$query().patch({ mc_channel: channel.id });

      const embed = defaultEmbed()
        .setTitle(inlineCode("✅ Minecraft Channel Configured"))
        .setDescription(
          `The bot will now post messages in ${channelMention(channel.id)}`
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
});
