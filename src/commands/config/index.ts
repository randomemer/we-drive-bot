import { registerSubcommands } from "@/modules/utils/functions";
import { SlashCommandBuilder } from "discord.js";
import mcChannelCommand from "./mc-channel";
import mcRoleCommand from "./mc-role";
import mcServerCommand from "./mc-server";

const builder = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Manage the bot's settings");

const command: BotCommandRoot = {
  data: builder,
  subCommands: registerSubcommands(builder, [
    mcRoleCommand,
    mcChannelCommand,
    mcServerCommand,
  ]),
};

export default command;
