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

declare global {
  interface ListenerConfig<K extends keyof ClientEvents> {
    name: K;
    listener(...args: ClientEvents[K]): Awaitable<void>;
  }

  // ====================================
  // Bot Commands
  // ====================================

  interface ICommand<T> {
    data: T;
  }

  interface BotCommandExecutable<T> extends ICommand<T> {
    callback(interaction: ChatInputCommandInteraction): Promise<void>;
    autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
  }

  type BotCommandRoot = BotCommandRootExecutable | BotCommandRootNonExecutable;

  interface BotCommandRootExecutable
    extends BotCommandExecutable<SlashCommandBuilder> {}

  interface BotCommandRootNonExecutable extends ICommand<SlashCommandBuilder> {
    subCommands?: Map<string, BotSubcommand>;
    subCommandGroups?: Map<string, BotSubcommandGroup>;
  }

  interface BotSubcommandGroup
    extends ICommand<SlashCommandSubcommandGroupBuilder> {
    subCommands: Map<string, BotSubcommand>;
  }
  interface BotSubcommand
    extends BotCommandExecutable<SlashCommandSubcommandBuilder> {}

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

  interface Advancement {
    id: string;
    title: string;
    description: string;
    category: string;
  }

  interface AdvancementProgress {
    criteria: Partial<Record<string, string>>;
    done: Boolean;
  }

  interface PlayerAdvancements
    extends Partial<Record<string, AdvancementProgress>> {}
}

declare module "discord.js" {
  interface Client {
    // vars
    slashCommands: Map<string, BotCommandRoot>;

    // function
    registerEventListeners(): Promise<void>;
    registerSlashCommands(): Promise<void>;
  }
}

export {};
