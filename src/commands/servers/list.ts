import { SlashCommandSubcommandBuilder } from "discord.js";

const command: BotSubcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("list")
    .setDescription("Get list of servers"),
  async callback(interaction) {
    try {
    } catch (error) {
      console.error(error);
    }
  },
};

export default command;
