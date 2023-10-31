import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { SlashCommandBuilder } from "discord.js";
import listCommand from "./list";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("servers")
    .setDescription("Commands related to servers"),
  subcommands: [listCommand],
});
