import pterodactyl from "@/modules/api";
import SubCommand from "@/modules/commands/sub-command";
import { GuildModelJoined } from "@/modules/db/models/guild";
import { defaultEmbed, getPageFooter } from "@/modules/utils/functions";
import PaginatedEmbedMessage from "@/modules/utils/paginated-embed";
import dayjs from "dayjs";
import { SlashCommandSubcommandBuilder, codeBlock } from "discord.js";
import { table } from "table";

export default new SubCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("list")
    .setDescription("List all the existing backups of the server"),

  async callback(interaction, context) {
    const guildModel = context.get("guild") as GuildModelJoined;
    const resp = await pterodactyl.get<PanelAPIResp<Backup[]>>(
      `/servers/${guildModel.mc_server}/backups`
    );

    const headers = ["#", "Name", "Created At"];

    const backups = resp.data.data.map((item, i) => [
      (i + 1).toString(),
      item.attributes.name,
      dayjs(item.attributes.created_at).format("DD/MM/YYYY h:mm A z"),
    ]);

    const paginator = new PaginatedEmbedMessage({
      content: backups,
      builder(items, meta) {
        const embed = defaultEmbed();

        const tableStr = table([headers, ...items], {
          columns: [
            {},
            { width: 25, wrapWord: true },
            { width: 25, wrapWord: true },
          ],
        });

        embed
          .setTitle("Backups")
          .setDescription(codeBlock(tableStr))
          .setFooter({ text: getPageFooter(meta) });

        return {
          embeds: [embed],
        };
      },
    });

    await paginator.sendMessage(interaction);
  },
});
