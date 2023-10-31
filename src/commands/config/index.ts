import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import mcChannel from "./mc-channel";
import mcRole from "./mc-role";
import mcServer from "./mc-server";
import ServerModel from "@/modules/db/models/server";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Manage the bot's settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  subcommands: [mcRole, mcChannel, mcServer],

  middleware: async function (interaction, ctx, next) {
    const server = await ServerModel.query().findById(interaction.guildId!);
    ctx.set("server", server);
    next();
  },
});
