import {
  APIApplicationCommandOptionChoice,
  SlashCommandSubcommandBuilder,
  codeBlock,
} from "discord.js";
import advancements from "@/assets/advancements.json";
import logger from "@/modules/utils/logger";
import UserModel from "@/modules/db/models/user";
import pterodactyl from "@/modules/api";
import ServerModel from "@/modules/db/models/server";
import { table } from "table";
import _ from "lodash";
import { defaultEmbed } from "@/modules/utils/functions";

const choices: APIApplicationCommandOptionChoice<string>[] = advancements.map(
  (item) => {
    return { name: item.title, value: item.id };
  }
);

const advancementsCommand: BotSubcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("advancements")
    .setDescription("View your advancement progress")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Name of the advancment")
        .setRequired(true)
        .setChoices(...choices.slice(0, 25))
    ),
  async callback(interaction) {
    try {
      const option = interaction.options.get("title", true);
      const tag = `minecraft:${option.value}`;

      const server = await ServerModel.query().findById(interaction.guildId!);
      const serverId = server?.mc_server;
      if (!serverId) throw new Error("Minecraft server has not configured");

      const player = await UserModel.query().findById(interaction.user.id);
      const uuid = player?.mc_uuid;
      if (!uuid) throw new Error("You have not created your profile");

      const filePath = `/world/advancements/${uuid}.json`;
      const resp = await pterodactyl.get<PlayerAdvancements>(
        `/servers/${serverId}/files/contents?file=${filePath}`
      );

      const advancement = advancements.find((adv) => adv.id === option.value)!;
      const advProgress = resp.data[tag];

      if (!advProgress) {
        interaction.editReply("No info about this advancement yet.");
        return;
      }

      logger.info(advProgress);

      const headerRow = ["Criteria", "Timestamp"];
      const bodyRows = _.entries(advProgress.criteria).map(([k, v]) => [
        k,
        new Date(v!).toUTCString(),
      ]);
      const rows: string[][] = [headerRow, ...bodyRows];
      const tableString = codeBlock(table(rows));

      const embed = defaultEmbed()
        .setDescription(tableString)
        .addFields(
          { name: "Category", value: advancement.category, inline: true },
          { name: "Completed", value: String(advProgress.done), inline: true },
          { name: "Title", value: advancement.title },
          { name: "Description", value: advancement.description }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error(error);
    }
  },
  async autocomplete(interaction) {
    try {
    } catch (error) {
      logger.error(error);
    }
  },
};

export default advancementsCommand;
