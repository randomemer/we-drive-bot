import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { guildMiddleware } from "@/modules/utils/middleware";
import { SlashCommandBuilder } from "discord.js";
import list from "./list";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("backups")
    .setDescription("Manage server backups"),
  middleware: guildMiddleware,
  subcommands: [list],
});
