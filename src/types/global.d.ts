import type {
  AutocompleteInteraction,
  Awaitable,
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  Interaction,
  InteractionEditReplyOptions,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import type { CommandType } from ".";
import type {
  RootCommandExecutable,
  RootCommandNonExecutable,
} from "@/modules/commands/root-command";
import type SubcommandGroup from "@/modules/commands/sub-command-group";
import type SubCommand from "@/modules/commands/sub-command";

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
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandSubcommandGroupBuilder
    | SlashCommandSubcommandBuilder;

  type MiddlewareFunc = (
    interaction: Interaction,
    context: Map<any, unknown>,
    next: Function
  ) => Awaitable<void>;

  interface ICommandExecutable {
    callback(
      interaction: ChatInputCommandInteraction,
      context: Map<any, unknown>
    ): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
  }

  interface ICommandRoot {
    dev: Boolean;
  }

  type RootCommand = RootCommandExecutable | RootCommandNonExecutable;

  type Command = RootCommand | SubcommandGroup | SubCommand;

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
