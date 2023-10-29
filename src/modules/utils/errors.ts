import { Interaction } from "discord.js";
import logger from "./logger";

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

    if (!interaction.deferred) {
      await interaction.reply({
        embeds: [{ title: "❌ Error", description: error.message }],
      });
    } else {
      await interaction.editReply({
        embeds: [{ title: "❌ Error", description: error.message }],
      });
    }
  } catch (err) {
    logger.error(err, `Failed to send error message`);
  }
}
