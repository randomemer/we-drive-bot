import {
  AutocompleteInteraction,
  Awaitable,
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  InteractionEditReplyOptions,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import { CommandType } from ".";

declare module "discord.js" {
  interface Client {
    slashCommands: Map<string, RootCommand>;

    registerEventListeners(): Promise<void>;
    registerSlashCommands(): Promise<void>;
  }
}

declare global {
  interface ListenerConfig<K extends keyof ClientEvents> {
    name: K;
    listener(...args: ClientEvents[K]): Awaitable<void>;
  }

  // ====================================
  // Bot Commands
  // ====================================

  type CommandBuilder =
    | SlashCommandBuilder
    | SlashCommandSubcommandGroupBuilder
    | SlashCommandSubcommandBuilder;

  interface ICommand<T extends CommandType, U extends CommandBuilder> {
    type: T;
    data: U;
  }

  interface ICommandExecutable {
    callback(interaction: ChatInputCommandInteraction): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
  }

  interface ICommandRoot<T extends CommandBuilder>
    extends ICommand<CommandType.Root, T> {
    dev?: Boolean;
  }

  type RootCommand = RootCommandExecutable | RootCommandNonExecutable;

  interface RootCommandExecutable
    extends ICommandExecutable,
      ICommandRoot<
        Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
      > {}

  interface RootCommandNonExecutable extends ICommandRoot<SlashCommandBuilder> {
    subCommands?: Map<string, Subcommand>;
    subCommandGroups?: Map<string, SubcommandGroup>;
  }

  interface SubcommandGroup
    extends ICommand<
      CommandType.SubCmdGroup,
      SlashCommandSubcommandGroupBuilder
    > {
    subCommands: Map<string, Subcommand>;
  }
  interface Subcommand
    extends ICommandExecutable,
      ICommand<CommandType.SubCmd, SlashCommandSubcommandBuilder> {}

  // ====================================
  // Paginated Embed
  // ====================================

  type BuilderFunctionMetadata = {
    curPage: number;
    maxPage: number;
    pageSize: number;
    total: number;
  };

  type BuilderFunction<T> = (
    items: T[],
    meta: BuilderFunctionMetadata
  ) => InteractionEditReplyOptions;

  interface PaginatedEmbedMessageData<T> {
    content: T[];
    builder: BuilderFunction<T>;
  }

  interface PaginatedEmbedMessageOptions {
    pageSize: number;
    btnTimeout: number;
  }
}

export {};
