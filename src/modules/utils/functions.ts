import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  inlineCode,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";

export function getPageFooter(meta: BuilderFunctionMetadata) {
  return `Showing ${meta.curPage * meta.pageSize + 1} - ${
    (meta.curPage + 1) * meta.pageSize
  } of ${meta.total}`;
}

export function registerSubcommands(
  mainCommand: SlashCommandBuilder | SlashCommandSubcommandGroupBuilder,
  subCommands: Subcommand[]
) {
  const map = new Map<string, Subcommand>();

  subCommands.forEach((cmd) => {
    mainCommand.addSubcommand(cmd.data);
    map.set(cmd.data.name, cmd);
  });

  return map;
}

export function registerSubcommandGroups(
  mainCommand: SlashCommandBuilder,
  subCommandGroups: SubcommandGroup[]
) {
  const map = new Map<string, SubcommandGroup>();

  subCommandGroups.forEach((group) => {
    mainCommand.addSubcommandGroup(group.data);
    map.set(group.data.name, group);
  });

  return map;
}

export function defaultEmbed() {
  return new EmbedBuilder().setColor(Colors.DarkVividPink);
}

export function getExecutableCmd(
  interaction: ChatInputCommandInteraction | AutocompleteInteraction
) {
  const { client } = interaction;

  const botCommand = client.slashCommands.get(interaction.commandName);
  if (!botCommand) return;
  if ("callback" in botCommand) return botCommand;

  const subCmdGroupName = interaction.options.getSubcommandGroup();
  const subCmdName = interaction.options.getSubcommand();

  // Check if there's a sub command group
  if (subCmdGroupName && botCommand.subCommandGroups) {
    const subCmdGroup = botCommand.subCommandGroups.get(subCmdGroupName)!;
    const subCmd = subCmdGroup.subCommands.get(subCmdName)!;
    return subCmd;
  }

  // Check if there's a subcommand
  if (subCmdName && botCommand.subCommands) {
    const subCmd = botCommand.subCommands!.get(subCmdName)!;
    return subCmd;
  }
}

export function getAllAdvancements(): Advancement[] {
  const filePath = path.join(process.cwd(), "assets", "advancements.json");
  const buffer = fs.readFileSync(filePath);
  const content = buffer.toString("utf8");
  return JSON.parse(content);
}

export function commandDefinition(name: string, desc: string) {
  return `- ${inlineCode("/" + name)} : ${desc}`;
}
