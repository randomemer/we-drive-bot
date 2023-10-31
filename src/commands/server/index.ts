import { registerSubcommands } from "@/modules/utils/functions";
import { SlashCommandBuilder } from "discord.js";
import powerCommand from "./power";
import { CommandType } from "@/types";

const builder = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Server management commands");

export default {
  type: CommandType.Root,
  data: builder,
  subCommands: registerSubcommands(builder, [powerCommand]),
} satisfies RootCommand;
