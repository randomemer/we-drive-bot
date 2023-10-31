import pterodactyl from "@/modules/api";
import ServerSocketManager from "@/modules/api/socket";
import SubCommand from "@/modules/commands/sub-command";
import ServerModel from "@/modules/db/models/server";
import sendErrorMessage from "@/modules/utils/errors";
import logger from "@/modules/utils/logger";
import {
  ActionRowBuilder,
  Client,
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
      const server = ctx.get("server") as ServerModel;
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
                value: item.attributes.identifier,
                description: item.attributes.description,
                emoji: { name: "🗄" },
                default: server.mc_server === item.attributes.identifier,
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

        await server.$query().patch({ mc_server: id });

        const editedEmbed = produce(reply.embeds[0].toJSON(), (embed) => {
          embed.description = "✅ Sucessfully changed default server";
        });

        await int.update({ embeds: [editedEmbed], components: [] });

        await updateServerSocket(interaction.client, interaction.guildId!);
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

async function updateServerSocket(client: Client, guildId: string) {
  const server = await ServerModel.query().findById(guildId);

  const manager = ServerSocketManager.managers.get(server!.id);
  if (manager) manager.close();

  new ServerSocketManager(client, server!);
}
