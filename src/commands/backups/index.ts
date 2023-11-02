import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { serverMiddleware } from "@/modules/utils/middleware";
import { SlashCommandBuilder } from "discord.js";
import list from "./list";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("backups")
    .setDescription("Manage server backups"),
  middleware: serverMiddleware,
  subcommands: [list],
});
