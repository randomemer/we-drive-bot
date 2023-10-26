import { SlashCommandBuilder } from "discord.js";
import createCommand from "./create";
import { registerSubcommands } from "@/modules/utils/functions";

const builder = new SlashCommandBuilder()
  .setName("player")
  .setDescription("Commands concerning a player");

const command: BotCommand = {
  data: builder,
  subCommands: registerSubcommands(builder, [createCommand]),
};

export default command;
