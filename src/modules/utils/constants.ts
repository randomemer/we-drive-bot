import { OAuth2Scopes, PermissionFlagsBits } from "discord.js";

export const UUID_TOOL_API = `http://tools.glowingmines.eu`;

export const BOT_PERMS = [PermissionFlagsBits.SendMessages];

export const BOT_SCOPES = [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands];

export const OAUTH_URL = `https://discord.com/api/oauth2/authorize`;

export const ADVANCEMENTS_URL = `https://minecraft.fandom.com/wiki/Advancement`;

export const PROCESS_STOP_SIGNALS = ["SIGINT", "SIGHUP", "SIGTERM"] as const;

export const DEV_GUILD_ID = "1165331231337103370";

export const POWER_CMDS = ["start", "stop", "restart", "kill"];

export const MAX_BACKUPS = 3;

//  Enums

export enum StatusMessage {
  "starting" = "Server starting...",
  "running" = "Server is online!",
  "stopping" = "Server is now stopping...",
  "offline" = "Server is now offline",
}

export enum AsyncStatus {
  Idle = "idle",
  Pending = "pending",
  Fulfilled = "fufilled",
  Rejected = "rejected",
}

export enum CommandType {
  Root = 0,
  SubCmdGroup = 1,
  SubCmd = 2,
}

export enum DataSizes {
  BYTE = 1,
  MEGA_BYTE = 1048576,
  GIGA_BYTE = 1073741824,
}
