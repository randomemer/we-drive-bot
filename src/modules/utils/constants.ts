import { OAuth2Scopes, PermissionFlagsBits } from "discord.js";

export const UUID_TOOL_API = `http://tools.glowingmines.eu`;

export const BOT_PERMS = [PermissionFlagsBits.SendMessages];

export const BOT_SCOPES = [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands];

export const ADVANCEMENTS_URL = `https://minecraft.fandom.com/wiki/Advancement`;

export const PROCESS_STOP_SIGNALS = ["SIGINT", "SIGHUP", "SIGTERM"] as const;

export const DEV_GUILD_ID = "1165331231337103370";

export const POWER_CMDS = ["start", "stop", "restart", "kill"];

export const OAUTH_URL = `https://discord.com/api/oauth2/authorize`;
