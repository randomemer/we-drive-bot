import { DataSizes } from "@/types";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  inlineCode,
} from "discord.js";
import _ from "lodash";
import fs from "node:fs";
import path from "node:path";

export function getPageFooter(meta: BuilderFunctionMetadata) {
  return `Showing ${meta.curPage * meta.pageSize + 1} - ${
    (meta.curPage + 1) * meta.pageSize
  } of ${meta.total}`;
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
  if (subCmdGroupName) {
    const subCmdGroup = botCommand.subcommandGroups.get(subCmdGroupName)!;
    const subCmd = subCmdGroup.subcommands.get(subCmdName)!;
    return subCmd;
  }

  // Check if there's a subcommand
  if (subCmdName && botCommand.subcommands) {
    const subCmd = botCommand.subcommands.get(subCmdName)!;
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

export function getCmdMiddlewares(cmd: Command | undefined): MiddlewareFunc[] {
  if (!cmd) return [];

  return [...getCmdMiddlewares(cmd.parent), ...cmd.middleware];
}

export function convertBytes(bytes: number, factor: DataSizes): string {
  return (bytes / factor).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}
