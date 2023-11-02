import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { playerMiddleware } from "@/modules/utils/middleware";
import { SlashCommandBuilder } from "discord.js";
import advancementsCommand from "./advancements";
import createCommand from "./create";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("player")
    .setDescription("Commands concerning a player"),

  subcommands: [createCommand, advancementsCommand],

  middleware: playerMiddleware,
});
