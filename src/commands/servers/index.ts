import { SlashCommandBuilder } from "discord.js";

import listCommand from "./list";
import { registerSubcommands } from "@/modules/utils/functions";

const builder = new SlashCommandBuilder()
  .setName("servers")
  .setDescription("Commands related to servers");

const command: BotCommand = {
  data: builder,
  subCommands: registerSubcommands(builder, [listCommand]),
};

export default command;
