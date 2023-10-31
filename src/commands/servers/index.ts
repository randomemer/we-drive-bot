import { SlashCommandBuilder } from "discord.js";

import listCommand from "./list";
import { registerSubcommands } from "@/modules/utils/functions";
import { CommandType } from "@/types";

const builder = new SlashCommandBuilder()
  .setName("servers")
  .setDescription("Commands related to servers");

export default {
  type: CommandType.Root,
  data: builder,
  subCommands: registerSubcommands(builder, [listCommand]),
} satisfies RootCommand;
