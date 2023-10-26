import {
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
  export interface ListenerConfig<K extends keyof ClientEvents> {
    name: K;
    listener(...args: ClientEvents[K]): Awaitable<void>;
  }

  export interface BaristaClient extends Client {
    botToken: string;
    clientId: string;
    guildId: string;
  }

  // ====================================
  // Bot Commands
  // ====================================

  export interface BotCommandSingular {
    data: SlashCommandBuilder;
    callback(interaction: ChatInputCommandInteraction): Promise<void>;
  }

  export interface BotCommandNested {
    data: SlashCommandBuilder;
    subCommands?: Map<string, BotSubcommand>;
    subCommandGroups?: Map<string, BotSubcommandGroup>;
  }

  export type BotCommand = BotCommandSingular | BotCommandNested;

  export interface BotSubcommandGroup {
    data: SlashCommandSubcommandGroupBuilder;
    subCommands: Map<string, BotSubcommand>;
  }

  export interface BotSubcommand {
    data: SlashCommandSubcommandBuilder;
    callback(interaction: ChatInputCommandInteraction): Promise<void>;
  }

  //

  export type BuilderFunctionMetadata = {
    curPage: number;
    maxPage: number;
    pageSize: number;
    total: number;
  };

  export type BuilderFunction<T> = (
    items: T[],
    meta: BuilderFunctionMetadata
  ) => InteractionEditReplyOptions;

  export interface PaginatedEmbedMessageData<T> {
    content: T[];
    builder: BuilderFunction<T>;
  }

  export interface PaginatedEmbedMessageOptions {
    pageSize: number;
  }
}

declare module "discord.js" {
  interface Client {
    // vars
    slashCommands: Map<string, BotCommand>;

    // function
    registerEventListeners(): Promise<void>;
    registerSlashCommands(): Promise<void>;
  }
}

export {};
