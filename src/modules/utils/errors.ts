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
  error: unknown,
  interaction: Interaction
) {
  try {
    if (!interaction.isRepliable()) return;

    const embed = defaultEmbed();

    // 1. Build the error message
    if (error instanceof AppError) {
      embed.setTitle(`❌ ${error.title}`).setDescription(error.message);
    } else if (error instanceof Error) {
      embed.setTitle("❌ Error").setDescription(error.message);
    } else return;

    // 2. Send the message
    if (!interaction.deferred) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.editReply({ embeds: [embed] });
    }
  } catch (err) {
    logger.error(err, `Failed to send error message`);
  }
}
