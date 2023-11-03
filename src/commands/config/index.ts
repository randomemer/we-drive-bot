import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { GuildModel } from "@/modules/db";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import backupCron from "./backup-cron";
import mcChannel from "./mc-channel";
import mcRole from "./mc-role";
import mcServer from "./mc-server";
import view from "./view";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Manage the bot's settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  subcommands: [mcRole, mcChannel, mcServer, backupCron, view],

  middleware: async function (interaction, ctx, next) {
    const guild = await GuildModel.query()
      .findById(interaction.guildId!)
      .withGraphJoined("minecraft_server");
    ctx.set("guild", guild);
    next();
  },
});
