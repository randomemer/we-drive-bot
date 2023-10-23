import pterodactyl from "@/modules/api";
import logger from "@/modules/utils/logger";
import { SlashCommandSubcommandBuilder } from "discord.js";

const command: BotSubcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("list")
    .setDescription("Get list of servers"),
  async callback(interaction) {
    try {
      const resp = await pterodactyl.get("/");
      await interaction.editReply({ content: JSON.stringify(resp.data) });
    } catch (error) {
      logger.error(error);
    }
  },
};

export default command;
