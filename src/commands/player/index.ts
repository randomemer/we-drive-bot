import { SlashCommandBuilder } from "discord.js";
import createCommand from "./create";
import { registerSubcommands } from "@/modules/utils/functions";
import advancementsCommand from "./advancements";

const builder = new SlashCommandBuilder()
  .setName("player")
  .setDescription("Commands concerning a player");

const command: BotCommandRoot = {
  data: builder,
  subCommands: registerSubcommands(builder, [
    createCommand,
    advancementsCommand,
  ]),
};

export default command;
