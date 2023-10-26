import {
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";

export function getPageFooter(meta: BuilderFunctionMetadata) {
  return `Showing ${meta.curPage * meta.pageSize + 1} - ${
    (meta.curPage + 1) * meta.pageSize
  } of ${meta.total}`;
}

export function registerSubcommands(
  mainCommand: SlashCommandBuilder | SlashCommandSubcommandGroupBuilder,
  subCommands: BotSubcommand[]
) {
  const map = new Map<string, BotSubcommand>();

  subCommands.forEach((cmd) => {
    mainCommand.addSubcommand(cmd.data);
    map.set(cmd.data.name, cmd);
  });

  return map;
}

export function registerSubcommandGroups(
  mainCommand: SlashCommandBuilder,
  subCommandGroups: BotSubcommandGroup[]
) {
  const map = new Map<string, BotSubcommandGroup>();

  subCommandGroups.forEach((group) => {
    mainCommand.addSubcommandGroup(group.data);
    map.set(group.data.name, group);
  });

  return map;
}
