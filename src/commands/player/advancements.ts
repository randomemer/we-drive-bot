import advancements from "@/assets/advancements.json";
import pterodactyl from "@/modules/api";
import SubCommand from "@/modules/commands/sub-command";
import { GuildModelJoined } from "@/modules/db/models/guild";
import UserModel from "@/modules/db/models/user";
import sendErrorMessage from "@/modules/utils/errors";
import { defaultEmbed, getPageFooter } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import { guildMiddleware, playerMiddleware } from "@/modules/utils/middleware";
import PaginatedEmbedMessage from "@/modules/utils/paginated-embed";
import dayjs from "dayjs";
import { SlashCommandSubcommandBuilder, codeBlock } from "discord.js";
import _ from "lodash";
import MiniSearch, { SearchResult } from "minisearch";
import { table } from "table";

const minisearch = new MiniSearch<Advancement>({
  fields: ["title"],
  storeFields: ["id", "title"],
  searchOptions: {
    fuzzy: 0.5,
  },
});

minisearch.addAll(advancements);

export default new SubCommand({
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

  middleware: [playerMiddleware, guildMiddleware],

  async callback(interaction, ctx) {
    try {
      const player = ctx.get("player") as UserModel | undefined;
      const guildModel = ctx.get("guild") as GuildModelJoined;

      const option = interaction.options.get("title", true);
      const tag = `minecraft:${option.value}`;

      const filePath = `/world/advancements/${player!.mc_uuid}.json`;
      const resp = await pterodactyl.get<PlayerAdvancements>(
        `/servers/${
          guildModel.minecraft_server!.id
        }/files/contents?file=${filePath}`
      );

      const advancement = advancements.find((adv) => adv.id === option.value)!;
      const advProgress = resp.data[tag];

      if (!advProgress) {
        interaction.editReply("No info about this advancement yet.");
        return;
      }

      const headerRow = ["Criteria", "Timestamp"];
      const bodyRows = _.entries(advProgress.criteria).map(([k, v]) => [
        _.startCase(k.replace("minecraft:", "")),
        dayjs(v).format("DD/MM/YYYY h:mm A z"),
      ]);

      const paginatedEmbed = new PaginatedEmbedMessage(
        {
          content: bodyRows,
          builder(items, meta) {
            const tableStr = codeBlock(
              table([headerRow, ...items], {
                columnDefault: { wrapWord: true, width: 27 },
              })
            );
            const embed = defaultEmbed()
              .setDescription(tableStr)
              .addFields(
                { name: "Category", value: advancement.category, inline: true },
                {
                  name: "Completed",
                  value: String(advProgress.done),
                  inline: true,
                },
                { name: "Title", value: advancement.title },
                { name: "Description", value: advancement.description }
              )
              .setFooter({ text: getPageFooter(meta) });

            return {
              embeds: [embed],
            };
          },
        },
        { pageSize: 20 }
      );

      await paginatedEmbed.sendMessage(interaction);
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
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
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
});
