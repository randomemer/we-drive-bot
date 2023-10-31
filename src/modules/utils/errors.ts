import { Interaction } from "discord.js";
import logger from "./logger";
import { defaultEmbed } from "./functions";

export class AppError extends Error {
  title: string;

  constructor(title?: string, message?: string, options?: ErrorOptions) {
    message = message ?? "Something went wrong";
    super(message, options);
    this.name = "AppError";
    this.title = title ?? "Application Error";
  }
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
