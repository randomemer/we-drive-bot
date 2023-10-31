import { RootCommandNonExecutable } from "@/modules/commands/root-command";
import { SlashCommandBuilder } from "discord.js";
import powerCommand from "./power";
import ServerModel from "@/modules/db/models/server";
import { AppError } from "@/modules/utils/errors";

export default new RootCommandNonExecutable({
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Server management commands"),

  subcommands: [powerCommand],

  async middleware(interaction, ctx, next) {
    const server = await ServerModel.query().findById(interaction.guildId!);

    if (!server?.mc_server) {
      throw new AppError(
        "Missing Configuration",
        "There is no minecraft server configured in settings"
      );
    }

    ctx.set("server", server);
    next();
  },
});
