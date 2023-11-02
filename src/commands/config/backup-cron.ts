import SubCommand from "@/modules/commands/sub-command";
import ServerModel from "@/modules/db/models/server";
import { AppError } from "@/modules/utils/errors";
import { defaultEmbed } from "@/modules/utils/functions";
import { SlashCommandSubcommandBuilder, inlineCode } from "discord.js";
import cron from "node-cron";

export default new SubCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("backup_schedule")
    .setDescription(
      "Set the schedule for server backups. Defaults to 12 AM UTC"
    )
    .addStringOption((option) =>
      option
        .setName("cron")
        .setDescription("Cron expression for your schedule")
        .setRequired(true)
    ),
  async callback(interaction, ctx) {
    const server = ctx.get("server") as ServerModel;
    const schedule = interaction.options.getString("cron", true);

    const isValid = cron.validate(schedule);
    if (!isValid) {
      throw new AppError(
        "Invalid Cron",
        "Please specify a valid cron string. Refer https://crontab.guru/"
      );
    }

    await server.$query().patch({ backup_cron: schedule });

    const embed = defaultEmbed()
      .setTitle("✅ Backup Schedule Updated")
      .setDescription(
        `Server backups will now follow ${inlineCode(schedule)} cron schedule`
      )
      .setTimestamp(new Date());

    await interaction.editReply({ embeds: [embed] });
  },
});
