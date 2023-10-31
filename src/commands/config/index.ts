import { registerSubcommands } from "@/modules/utils/functions";
import { CommandType } from "@/types";
import { SlashCommandBuilder } from "discord.js";
import mcChannel from "./mc-channel";
import mcRole from "./mc-role";
import mcServer from "./mc-server";

const builder = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Manage the bot's settings");

const command: RootCommand = {
  type: CommandType.Root,
  data: builder,
  subCommands: registerSubcommands(builder, [mcRole, mcChannel, mcServer]),
};

mcChannel;
export default command;
