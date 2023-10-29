import pterodactyl from "@/modules/api";
import sendErrorMessage from "@/modules/utils/errors";
import * as utils from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import PaginatedEmbedMessage from "@/modules/utils/paginated-embed";
import { SlashCommandSubcommandBuilder, codeBlock } from "discord.js";
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
          const embed = utils
            .defaultEmbed()
            .setURL("https://control.sparkedhost.us/")
            .setTitle("Servers")
            .setDescription(codeBlock(table([headers, ...items])))
            .setFooter({ text: utils.getPageFooter(meta) });

          return {
            embeds: [embed],
          };
        },
      });

      await paginator.sendMessage(interaction);
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
};

export default command;
