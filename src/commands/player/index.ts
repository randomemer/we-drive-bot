import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { SlashCommandBuilder } from "discord.js";
import advancementsCommand from "./advancements";
import createCommand from "./create";
import UserModel from "@/modules/db/models/user";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("player")
    .setDescription("Commands concerning a player"),

  subcommands: [createCommand, advancementsCommand],

  middleware: async function (interaction, ctx, next) {
    const userModel = await UserModel.query().findById(interaction.user.id);
    ctx.set("player", userModel);
    next();
  },
});
