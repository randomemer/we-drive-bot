import { registerSubcommands } from "@/modules/utils/functions";
import { SlashCommandBuilder } from "discord.js";
import powerCommand from "./power";

const builder = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Server management commands");

const command: BotCommandRoot = {
  data: builder,
  subCommands: registerSubcommands(builder, [powerCommand]),
};

export default command;
