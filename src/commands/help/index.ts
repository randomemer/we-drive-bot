import { DEV_GUILD_ID } from "@/modules/utils/constants";
import sendErrorMessage from "@/modules/utils/errors";
import { defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import PaginatedEmbedMessage from "@/modules/utils/paginated-embed";
import { SlashCommandBuilder, bold, inlineCode } from "discord.js";
import _ from "lodash";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View information about available commands")
    .addStringOption((option) =>
      option.setName("command").setDescription("Name of the command")
    ),
  async callback(interaction) {
    try {
      const cmdOption = interaction.options.getString("command");

      if (cmdOption) {
        const cmd = interaction.client.slashCommands.get(cmdOption);
        if (!cmd) throw new Error(`Command not found`);

        const embed = defaultEmbed()
          .setTitle(`Command Help - ${inlineCode(cmd.data.name)}`)
          .setDescription(`${cmd.data.description}\n\n${bold("Subcommands")}`);

        await interaction.editReply({ embeds: [embed] });
      } else {
        const commands = Array.from(interaction.client.slashCommands.values());
        const sorted = _.sortBy(commands, (cmd) => cmd.data.name).filter(
          (cmd) => !cmd.dev || interaction.guildId === DEV_GUILD_ID
        );

        const paginator = new PaginatedEmbedMessage({
          content: sorted,
          builder(items) {
            const strs = items.map(
              (cmd) => `${bold(cmd.data.name)} : ${cmd.data.description}`
            );

            const embed = defaultEmbed()
              .setTitle("Commands Help")
              .setDescription(
                `Use the help command to see more info about a command\n\n${strs.join(
                  "\n\n"
                )}`
              );

            return {
              embeds: [embed],
            };
          },
        });

        await paginator.sendMessage(interaction);
      }
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
} satisfies BotCommandRoot;
