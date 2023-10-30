import ServerSocketManager from "@/modules/api/socket";
import { POWER_CMDS } from "@/modules/utils/constants";
import sendErrorMessage from "@/modules/utils/errors";
import logger from "@/modules/utils/logger";
import { SlashCommandSubcommandBuilder } from "discord.js";

const powerCommand: BotSubcommand = {
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
  async callback(interaction) {
    try {
      const option = interaction.options.get("state", true);
      const state = option.value as ServerPowerState;
      const manager = ServerSocketManager.managers.get(interaction.guildId!);

      switch (state) {
        case "start": {
          manager?.sendPowerState(state);
          break;
        }

        default:
          break;
      }
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
};

export default powerCommand;
