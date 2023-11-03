import SubCommand from "@/modules/commands/sub-command";
import UserModel from "@/modules/db/models/user";
import { UUID_TOOL_API } from "@/modules/utils/constants";
import sendErrorMessage from "@/modules/utils/errors";
import { defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import axios from "axios";
import {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";

export default new SubCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Get started by creating a profile with a the bot")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("username")
        .setDescription("Your minecraft username")
        .setRequired(true)
    ),

  async callback(interaction, ctx) {
    try {
      const username = interaction.options.getString("username", true);
      const player = ctx.get("player") as UserModel | undefined;

      if (player) {
        const embed = defaultEmbed()
          .setTitle("Player Profile Already Created")
          .addFields([
            { name: "Username", value: player.mc_name ?? "<nil>" },
            { name: "UUID", value: player.mc_uuid ?? "<nil>" },
          ]);
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const resp = await axios.get(
        `${UUID_TOOL_API}/convertor/nick/${username}`
      );
      const uuid = resp.data.offlinesplitteduuid;

      await UserModel.query().insert({
        id: interaction.user.id,
        mc_name: username,
        mc_uuid: uuid,
      });

      const embed = defaultEmbed()
        .setTitle("✅ Player Profile Created")
        .addFields([
          { name: "Username", value: username },
          { name: "UUID", value: uuid },
        ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
});
