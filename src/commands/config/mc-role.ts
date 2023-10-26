import ServerModel from "@/modules/db/models/server";
import { defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import {
  Colors,
  EmbedBuilder,
  SlashCommandRoleOption,
  SlashCommandSubcommandBuilder,
  roleMention,
} from "discord.js";

const mcRoleCommand: BotSubcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("minecraft_role")
    .setDescription("Set the default minecraft role for pinging members")
    .addRoleOption(
      new SlashCommandRoleOption()
        .setName("role")
        .setDescription("A mentionable role for minecraft players")
        .setRequired(true)
    ),
  async callback(interaction) {
    try {
      const role = interaction.options.getRole("role", true);

      const embed = defaultEmbed();

      if (!role.mentionable) {
        embed
          .setTitle("❌ Invalid role")
          .setDescription(
            `Please provide a mentionable role, or make ${roleMention(
              role.id
            )} mentionable`
          );
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Change the server's config
      await ServerModel.query()
        .where("id", interaction.guildId)
        .patch({ mc_role: role.id });

      embed
        .setTitle("✅ Minecraft role configured")
        .setDescription(
          `The bot will now use ${roleMention(
            role.id
          )} to ping minecraft players.`
        );
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error(error);
    }
  },
};

export default mcRoleCommand;
