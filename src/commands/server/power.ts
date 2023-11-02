import pterodactyl from "@/modules/api";
import ServerSocketManager from "@/modules/api/socket";
import SubCommand from "@/modules/commands/sub-command";
import ServerModel from "@/modules/db/models/server";
import UserModel from "@/modules/db/models/user";
import { POWER_CMDS } from "@/modules/utils/constants";
import sendErrorMessage, { AppError } from "@/modules/utils/errors";
import { defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import { playerMiddleware } from "@/modules/utils/middleware";
import {
  PermissionFlagsBits,
  SlashCommandSubcommandBuilder,
  inlineCode,
} from "discord.js";

export default new SubCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("power")
    .setDescription("Send a power command to the server")
    .addStringOption((option) =>
      option
        .setName("state")
        .setRequired(true)
        .setDescription("Power signal to send to the server")
        .addChoices(
          ...POWER_CMDS.map((cmd) => {
            return { name: cmd, value: cmd };
          })
        )
    ),

  middleware: [playerMiddleware],

  async callback(interaction, ctx) {
    try {
      const player = ctx.get("player") as UserModel;
      const server = ctx.get("server") as ServerModel;
      const serverId = server.mc_server!;

      const option = interaction.options.get("state", true);
      const state = option.value as ServerPowerState;

      const manager = ServerSocketManager.managers.get(interaction.guildId!);
      if (!manager) throw new AppError();

      switch (state) {
        case "start": {
          manager.sendPowerState(state);
          break;
        }

        // Can only execute if no players are active
        case "stop":
        case "restart": {
          const resp = await pterodactyl.get<MinecraftPlayersResp>(
            `/servers/${serverId}/minecraft-players`
          );

          if (resp.data.data.online_player_count > 0) {
            throw new AppError(
              "Cannot Perform Action",
              "Cannot issue this command when there are players online"
            );
          }

          manager.sendPowerState(state);
          break;
        }

        // Can only execute if user is server operator in minecraft and a mod
        case "kill": {
          const isMod = interaction.memberPermissions?.has(
            PermissionFlagsBits.ManageGuild
          );

          if (!isMod)
            throw new AppError(
              "Insufficient Permissions",
              "Only members with manage guild permission can perform this action"
            );

          const resp = await pterodactyl.get<MinecraftPlayersResp>(
            `/servers/${serverId}/minecraft-players`
          );

          const isOp = resp.data.data.operators.some(
            (op) => op.uuid === player.mc_uuid
          );

          if (!isOp)
            throw new AppError(
              "Insufficient Permissions",
              "Only server operators can perform this action"
            );

          manager.sendPowerState(state);
          break;
        }

        default:
          break;
      }

      const embed = defaultEmbed()
        .setTitle("✅ Command Executed")
        .setDescription(
          `${inlineCode(state)} command has been sent to the minecraft server`
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
});
