import SubCommand from "@/modules/commands/sub-command";
import sendErrorMessage from "@/modules/utils/errors";
import { defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import dayjs from "dayjs";
import { SlashCommandSubcommandBuilder } from "discord.js";
import osutils from "node-os-utils";

export default new SubCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("health")
    .setDescription("Get info about the bot's health"),

  async callback(interaction) {
    try {
      //@ts-ignore
      if (osutils.isNotSupported()) {
        throw new Error(
          "Calculating resource usage is not possible in this environment"
        );
      }

      const cpuUsage = await osutils.cpu.usage();
      const memUsage = await osutils.mem.info();
      // @ts-ignore
      const diskUsage = await osutils.drive.info();
      const uptime = osutils.os.uptime();
      const uptimef = dayjs
        .duration(uptime * 1000)
        .format("D [d] H [h] m [m] s [s]");
      const processes = await osutils.proc.totalProcesses();
      const netStat = await osutils.netstat.inOut();

      const embed = defaultEmbed()
        .setTitle("📊 Bot Health")
        .addFields(
          { name: "CPU Usage", value: `${cpuUsage} %`, inline: true },
          {
            name: "Memory",
            value: `${memUsage.usedMemMb.toLocaleString()} MB / ${memUsage.totalMemMb.toLocaleString()} MB`,
            inline: true,
          },
          {
            name: "Disk Usage",
            value: `${diskUsage.usedGb} GB / ${diskUsage.totalGb} GB`,
            inline: true,
          },
          {
            name: "Uptime",
            value: uptimef,
            inline: true,
          },
          { name: "Processes", value: `${processes}`, inline: true },
          { name: "Network", value: `${netStat}`, inline: true }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await sendErrorMessage(error as Error, interaction);
      logger.error(error);
    }
  },
});
