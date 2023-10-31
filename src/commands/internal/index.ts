import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { SlashCommandBuilder } from "discord.js";
import healthCommand from "./health";
import reloadCommand from "./reload";

export default new RootCommandNonExecutable({
  dev: true,
  data: new SlashCommandBuilder()
    .setName("internal")
    .setDescription("Internal commands only for devs"),
  subcommands: [reloadCommand, healthCommand],
});
