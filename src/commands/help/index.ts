import { DEV_GUILD_ID } from "@/modules/utils/constants";
import sendErrorMessage from "@/modules/utils/errors";
import { commandDefinition, defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import PaginatedEmbedMessage from "@/modules/utils/paginated-embed";
import { CommandType } from "@/types";
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  bold,
  inlineCode,
} from "discord.js";
import _ from "lodash";

export default {
  type: CommandType.Root,
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
        await helpCommand(interaction, cmdOption);
      } else {
        await helpAllCommands(interaction);
      }
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
} satisfies RootCommand;

async function helpAllCommands(interaction: ChatInputCommandInteraction) {
  const commands = Array.from(interaction.client.slashCommands.values());
  const sorted = _.sortBy(commands, (cmd) => cmd.data.name).filter(
    (cmd) => !cmd.dev || interaction.guildId === DEV_GUILD_ID
  );

  const paginator = new PaginatedEmbedMessage({
    content: sorted,
    builder(items) {
      const strs = items.map(
        (cmd) =>
          `- ${inlineCode("/" + cmd.data.name)} : ${cmd.data.description}`
      );

      const embed = defaultEmbed()
        .setTitle("Commands Help")
        .setThumbnail(interaction.client.user.avatarURL({ size: 256 }))
        .setDescription(
          "Use the help command to see more info about a command\n\n" +
            `${strs.join("\n")}`
        );

      return {
        embeds: [embed],
      };
    },
  });

  await paginator.sendMessage(interaction);
}

async function helpCommand(
  interaction: ChatInputCommandInteraction,
  cmdOption: string
) {
  const cmd = interaction.client.slashCommands.get(cmdOption);
  if (!cmd) throw new Error(`Command not found`);

  const embed = defaultEmbed()
    .setThumbnail(interaction.client.user.avatarURL({ size: 256 }))
    .setTitle(`Command Help - ${inlineCode("/" + cmd.data.name)}`);

  let desc = `${cmd.data.description}`;

  const infos: string[] = [];

  if ("subCommands" in cmd) {
    cmd.subCommands!.forEach((subCmd) => {
      infos.push(
        commandDefinition(
          `${cmd.data.name} ${subCmd.data.name}`,
          cmd.data.description
        )
      );
    });
  }

  if ("subCommandGroups" in cmd) {
    cmd.subCommandGroups!.forEach((cmdGroup) => {
      cmdGroup.subCommands.forEach((subCmd) => {
        infos.push(
          commandDefinition(
            ` ${cmd.data.name} ${cmdGroup.data.name} ${subCmd.data.name}`,
            subCmd.data.description
          )
        );
      });
    });
  }

  if (infos.length) {
    desc += "\n\n" + bold("Subcommands") + "\n" + infos.join("\n");
  }

  embed.setDescription(desc);

  await interaction.editReply({ embeds: [embed] });
}
