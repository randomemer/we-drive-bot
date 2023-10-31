import { SlashCommandBuilder } from "discord.js";
import createCommand from "./create";
import { registerSubcommands } from "@/modules/utils/functions";
import advancementsCommand from "./advancements";
import { CommandType } from "@/types";

const builder = new SlashCommandBuilder()
  .setName("player")
  .setDescription("Commands concerning a player");

export default {
  type: CommandType.Root,
  data: builder,
  subCommands: registerSubcommands(builder, [
    createCommand,
    advancementsCommand,
  ]),
} satisfies RootCommand;
