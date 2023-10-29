import { PermissionFlagsBits } from "discord.js";

export const UUID_TOOL_API = `http://tools.glowingmines.eu`;

export const BOT_PERMS = [PermissionFlagsBits.SendMessages];

export const BOT_SCOPES = ["bot", "applications.commands"];

export const ADVANCEMENTS_URL = `https://minecraft.fandom.com/wiki/Advancement`;

export const PROCESS_STOP_SIGNALS = ["SIGINT", "SIGHUP", "SIGTERM"] as const;
