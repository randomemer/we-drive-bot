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
import MiniSearch, { SearchResult } from "minisearch";

const minisearch = new MiniSearch<Advancement>({
  fields: ["title"],
  storeFields: ["id", "title"],
  searchOptions: {
    fuzzy: 0.5,
  },
});

minisearch.addAll(advancements);

const advancementsCommand: BotSubcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("advancements")
    .setDescription("View your advancement progress")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Name of the advancment")
        .setRequired(true)
        .setAutocomplete(true)
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

      const headerRow = ["Criteria", "Timestamp"];
      const bodyRows = _.entries(advProgress.criteria).map(([k, v]) => [
        _.trimStart(k, "minecraft:"),
        new Date(v!).toUTCString(),
      ]);
      const rows: string[][] = [headerRow, ...bodyRows];
      const tableString = codeBlock(table(rows));

      const titleEmbed = defaultEmbed().addFields(
        { name: "Category", value: advancement.category, inline: true },
        { name: "Completed", value: String(advProgress.done), inline: true },
        { name: "Title", value: advancement.title },
        { name: "Description", value: advancement.description }
      );

      const descEmbed = defaultEmbed().setDescription(tableString);
      console.log(tableString.length);

      await interaction.editReply({ embeds: [titleEmbed, descEmbed] });
    } catch (error) {
      logger.error(error);
    }
  },
  async autocomplete(interaction) {
    try {
      const query = interaction.options.getFocused();
      const results = minisearch.search(query) as (SearchResult &
        Pick<Advancement, "id" | "title">)[];

      const choices = results
        .map((item) => ({
          name: item.title,
          value: item.id,
        }))
        .slice(0, 25);
      await interaction.respond(choices);
    } catch (error) {
      logger.error(error);
    }
  },
};

export default advancementsCommand;
