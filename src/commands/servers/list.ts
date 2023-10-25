import pterodactyl from "@/modules/api";
import * as utils from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import PaginatedEmbedMessage from "@/modules/utils/paginated-embed";
import { Colors, SlashCommandSubcommandBuilder } from "discord.js";
import { table } from "table";

const command: BotSubcommand = {
  data: new SlashCommandSubcommandBuilder()
    .setName("list")
    .setDescription("Get list of servers"),
  async callback(interaction) {
    try {
      const resp = await pterodactyl.get<PanelAPIResp<PterodactylServer[]>>(
        "/"
      );

      const content = resp.data.data.map((server, i) => [
        i + 1,
        server.attributes.identifier,
        server.attributes.name,
        server.attributes.description,
      ]);

      const paginator = new PaginatedEmbedMessage<any>({
        content,
        builder(items, meta) {
          const headers = ["#", "ID", "Name", "Description"];
          return {
            embeds: [
              {
                color: Colors.DarkVividPink,
                url: "https://control.sparkedhost.us/",
                title: "Servers",
                description: "```" + table([headers, ...items]) + "```",
                footer: { text: utils.getPageFooter(meta) },
              },
            ],
          };
        },
      });

      await paginator.sendMessage(interaction);
    } catch (error) {
      logger.error(error);
    }
  },
};

export default command;
