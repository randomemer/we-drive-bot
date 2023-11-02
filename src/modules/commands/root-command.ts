import { CommandType } from "@/modules/utils/constants";
import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import BaseCommand, { BaseCommandOptions } from "./base-command";
import SubCommand from "./sub-command";
import SubcommandGroup from "./sub-command-group";

export interface RootCommandExecutableOptions
  extends Omit<BaseCommandOptions, "type">,
    ICommandExecutable,
    Partial<ICommandRoot> {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
}

export class RootCommandExecutable
  extends BaseCommand
  implements ICommandExecutable, ICommandRoot
{
  declare readonly type: CommandType.Root;
  declare readonly data: Omit<
    SlashCommandBuilder,
    "addSubcommand" | "addSubcommandGroup"
  >;

  declare readonly parent: undefined;

  readonly dev: Boolean;

  constructor(options: RootCommandExecutableOptions) {
    super({ ...options, type: CommandType.Root });

    this.callback = options.callback;
    this.autocomplete = options.autocomplete;
    this.dev = options.dev ?? false;
  }

  callback: (
    interaction: ChatInputCommandInteraction<CacheType>,
    context: any
  ) => Promise<void>;

  autocomplete?: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void>;
}

export interface RootCommandNonExecutableOptions
  extends Omit<BaseCommandOptions, "type">,
    Partial<ICommandRoot> {
  data: SlashCommandBuilder;
  subcommands?: SubCommand[];
  subcommandGroups?: SubcommandGroup[];
}

export class RootCommandNonExecutable extends BaseCommand {
  declare readonly type: CommandType.Root;
  declare readonly data: SlashCommandBuilder;

  declare parent: undefined;

  readonly dev: Boolean;

  subcommands = new Map<string, SubCommand>();
  subcommandGroups = new Map<string, SubcommandGroup>();

  constructor(options: RootCommandNonExecutableOptions) {
    super({ ...options, type: CommandType.Root });

    this.dev = options.dev ?? false;

    if (options.subcommands) {
      for (const cmd of options.subcommands) {
        this.data.addSubcommand(cmd.data);
        cmd.parent = this;
        this.subcommands.set(cmd.data.name, cmd);
      }
    }

    if (options.subcommandGroups) {
      for (const cmd of options.subcommandGroups) {
        this.data.addSubcommandGroup(cmd.data);
        cmd.parent = this;
        this.subcommandGroups.set(cmd.data.name, cmd);
      }
    }
  }
}
