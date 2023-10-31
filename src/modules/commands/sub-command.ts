import { CommandType } from "@/types";
import BaseCommand, { BaseCommandOptions } from "./base-command";
import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import SubcommandGroup from "./sub-command-group";
import { RootCommandNonExecutable } from "./root-command";

interface SubCommandOptions
  extends Omit<BaseCommandOptions, "type">,
    ICommandExecutable {
  data: SlashCommandSubcommandBuilder;
}

export default class SubCommand
  extends BaseCommand
  implements ICommandExecutable
{
  declare readonly type: CommandType.SubCmd;
  declare readonly data: SlashCommandSubcommandBuilder;

  declare parent: SubcommandGroup | RootCommandNonExecutable;

  constructor(options: SubCommandOptions) {
    super({ ...options, type: CommandType.SubCmd });

    this.callback = options.callback;
    this.autocomplete = options.autocomplete;
  }

  callback: (
    interaction: ChatInputCommandInteraction<CacheType>,
    context: any
  ) => Promise<void>;

  autocomplete?: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void>;
}
