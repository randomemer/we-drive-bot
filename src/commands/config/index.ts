import { registerSubcommands } from "@/modules/utils/functions";
import { SlashCommandBuilder } from "discord.js";
import mcRoleCommand from "./mc-role";
import mcChannelCommand from "./mc-channel";
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
