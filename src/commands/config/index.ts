import { registerSubcommands } from "@/modules/utils/functions";
import { SlashCommandBuilder } from "discord.js";
import mcRoleCommand from "./mc-role";

const builder = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Manage the bot's settings");

const command: BotCommand = {
  data: builder,
  subCommands: registerSubcommands(builder, [mcRoleCommand]),
};

export default command;
