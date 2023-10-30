import { registerSubcommands } from "@/modules/utils/functions";
import { SlashCommandBuilder } from "discord.js";
import reloadCommand from "./reload";

const builder = new SlashCommandBuilder()
  .setName("internal")
  .setDescription("Internal commands only for devs");

const command: BotCommandRoot = {
  data: builder,
  dev: true,
  subCommands: registerSubcommands(builder, [reloadCommand]),
};

export default command;
