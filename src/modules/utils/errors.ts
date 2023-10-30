import { Interaction } from "discord.js";
import logger from "./logger";
import { defaultEmbed } from "./functions";

export class BotError extends Error {
  title: string;

  // constructor()
}

export default async function sendErrorMessage(
  error: Error,
  interaction: Interaction
) {
  try {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;

    const embed = defaultEmbed();

    if (!interaction.deferred) {
      embed.setTitle("❌ Error").setDescription(error.message);
    } else {
      embed.setTitle("❌ Error").setDescription(error.message);
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    logger.error(err, `Failed to send error message`);
  }
}
