import { registerSubcommands } from "@/modules/utils/functions";
import { SlashCommandBuilder } from "discord.js";
import healthCommand from "./health";
import reloadCommand from "./reload";
import { CommandType } from "@/types";

const builder = new SlashCommandBuilder()
  .setName("internal")
  .setDescription("Internal commands only for devs");

export default {
  type: CommandType.Root,
  dev: true,
  data: builder,
  subCommands: registerSubcommands(builder, [reloadCommand, healthCommand]),
} satisfies RootCommand;
