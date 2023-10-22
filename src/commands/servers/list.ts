import pterodactyl from "@/modules/api";
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
      console.error(error);
    }
  },
};

export default command;
