import logger from "@/modules/utils/logger";
import {
  Colors,
  EmbedBuilder,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  codeBlock,
  inlineCode,
} from "discord.js";
import axios from "axios";
import { UUID_TOOL_API } from "@/modules/utils/constants";
import UserModel from "@/modules/db/models/user";
import { defaultEmbed } from "@/modules/utils/functions";

const createCommand: BotSubcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Get started by creating a profile with a the bot")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("username")
        .setDescription("Your minecraft username")
        .setRequired(true)
    ),
  async callback(interaction) {
    try {
      const username = interaction.options.getString("username", true);

      const exists = await UserModel.query().findById(interaction.user.id);

      if (exists) {
        const embed = defaultEmbed()
          .setTitle(inlineCode("Your profile already exists"))
          .addFields([
            { name: "Username", value: inlineCode(exists.mc_name ?? "<nil>") },
            { name: "UUID", value: inlineCode(exists.mc_uuid ?? "<nil>") },
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
        .setTitle(inlineCode("✅ Player Profile Created"))
        .addFields([
          { name: "Username", value: inlineCode(username) },
          { name: "UUID", value: inlineCode(uuid) },
        ]);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error(error);
    }
  },
};

export default createCommand;
