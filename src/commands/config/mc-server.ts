import pterodactyl from "@/modules/api";
import SubCommand from "@/modules/commands/sub-command";
import { GuildModelJoined } from "@/modules/db/models/guild";
import ServerModel from "@/modules/db/models/server";
import sendErrorMessage from "@/modules/utils/errors";
import logger from "@/modules/utils/logger";
import {
  ActionRowBuilder,
  Colors,
  ComponentType,
  SlashCommandSubcommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { produce } from "immer";

export default new SubCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("minecraft_server")
    .setDescription("Set the default server for all server commands"),

  async callback(interaction, ctx) {
    try {
      const guildModel = ctx.get("guild") as GuildModelJoined;
      const resp = await pterodactyl.get<PanelAPIResp<PterodactylServer[]>>(
        "/"
      );

      const select = new StringSelectMenuBuilder()
        .setCustomId("server_select")
        .setPlaceholder("Select a server")
        .addOptions(
          resp.data.data.map(
            (item) =>
              new StringSelectMenuOptionBuilder({
                label: item.attributes.name,
                value: item.attributes.uuid,
                description: item.attributes.description,
                emoji: { name: "🗄" },
                default: guildModel.mc_server === item.attributes.uuid,
              })
          )
        );

      const row = new ActionRowBuilder().addComponents(select);

      const reply = await interaction.editReply({
        embeds: [
          {
            color: Colors.DarkVividPink,
            description: `Choose a default server to use for all actions with this command`,
          },
        ],
        components: [row.toJSON() as any],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60_000,
        filter: (int) => int.user.id === interaction.user.id,
      });

      collector.on("collect", async (int) => {
        const id = int.values[0];

        const serverModel = await ServerModel.query()
          .insert({ id })
          .onConflict("id")
          .ignore();

        await guildModel.$query().patch({ mc_server: serverModel.id });

        const editedEmbed = produce(reply.embeds[0].toJSON(), (embed) => {
          embed.description = "✅ Sucessfully Updated Default Server";
        });

        await int.update({ embeds: [editedEmbed], components: [] });
      });

      collector.on("end", () => {
        reply.edit({ components: [] });
      });
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
});
