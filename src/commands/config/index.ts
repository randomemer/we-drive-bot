import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { SlashCommandBuilder } from "discord.js";
import mcChannel from "./mc-channel";
import mcRole from "./mc-role";
import mcServer from "./mc-server";
import logger from "@/modules/utils/logger";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Manage the bot's settings"),

  subcommands: [mcRole, mcChannel, mcServer],
});
