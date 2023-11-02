import { CommandType } from "@/modules/utils/constants";
import BaseCommand, { BaseCommandOptions } from "./base-command";
import SubCommand from "./sub-command";
import { SlashCommandSubcommandGroupBuilder } from "discord.js";
import { RootCommandNonExecutable } from "./root-command";

export interface SubcommandGroupOptions
  extends Omit<BaseCommandOptions, "type"> {
  data: SlashCommandSubcommandGroupBuilder;
  subcommands?: SubCommand[];
}

export default class SubcommandGroup extends BaseCommand {
  declare readonly type: CommandType.SubCmdGroup;
  declare readonly data: SlashCommandSubcommandGroupBuilder;

  declare parent: RootCommandNonExecutable;

  subcommands = new Map<string, SubCommand>();

  constructor(options: SubcommandGroupOptions) {
    super({ ...options, type: CommandType.SubCmdGroup });

    if (options.subcommands) {
      for (const cmd of options.subcommands) {
        this.data.addSubcommand(cmd.data);
        cmd.parent = this;
        this.subcommands.set(cmd.data.name, cmd);
      }
    }
  }
}
