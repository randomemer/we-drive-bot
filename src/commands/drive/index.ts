import { RootCommandExecutable } from "@/modules/commands/root-command";
import { AppError } from "@/modules/utils/errors";
import VoiceSession from "@/modules/voice/session";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default new RootCommandExecutable({
  data: new SlashCommandBuilder()
    .setName("drive")
    .setDescription("Takes you for a drive"),
  async callback(interaction) {
    const guild = interaction.client.guilds.cache.get(interaction.guildId!);
    const member = guild?.members.cache.get(interaction.user.id);
    const channel = member?.voice.channel;

    if (!channel) {
      throw new AppError(
        "Not In Voice Channel",
        "Join any voice channel, so I can take you for a drive"
      );
    }

    const perms = channel.permissionsFor(interaction.client.user);
    if (
      !perms?.has(PermissionFlagsBits.Connect) ||
      !perms.has(PermissionFlagsBits.Speak)
    ) {
      throw new AppError(
        "Insufficient Permissions",
        "I don't have permission to join that voice channel"
      );
    }
    await interaction.deleteReply();

    const session = new VoiceSession(channel, interaction.channel!);
    session.init();
  },
});
