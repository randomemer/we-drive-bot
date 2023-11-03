import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { guildMiddleware } from "@/modules/utils/middleware";
import { SlashCommandBuilder } from "discord.js";
import powerCommand from "./power";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Server management commands"),

  subcommands: [powerCommand],

  middleware: guildMiddleware,
});
