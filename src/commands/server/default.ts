import pterodactyl from "@/modules/api";
import ServerModel from "@/modules/db/models/server";
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

const command: BotSubcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("default")
    .setDescription("Set the default server for all commands"),
  async callback(interaction) {
    try {
      const resp = await pterodactyl.get<PanelAPIResp<PterodactylServer[]>>(
        "/"
      );

      const select = new StringSelectMenuBuilder()
        .setCustomId("server_select")
        .setPlaceholder("Select a server")
        .addOptions(
          resp.data.data.map(
            (server) =>
              new StringSelectMenuOptionBuilder({
                label: server.attributes.name,
                value: server.attributes.identifier,
                description: server.attributes.description,
                emoji: { name: "🗄" },
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
        await ServerModel.query()
          .where("id", int.guildId)
          .patch({ mc_server: id });

        const editedEmbed = produce(reply.embeds[0].toJSON(), (embed) => {
          embed.description = "✅ Sucessfully changed default server";
        });

        await int.update({ embeds: [editedEmbed], components: [] });
      });

      collector.on("end", () => {
        reply.edit({ components: [] });
      });
    } catch (error) {
      logger.error(error);
    }
  },
};

export default command;
