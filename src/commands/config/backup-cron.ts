import SubCommand from "@/modules/commands/sub-command";
import { GuildModelJoined } from "@/modules/db/models/guild";
import { AppError } from "@/modules/utils/errors";
import { defaultEmbed } from "@/modules/utils/functions";
import { guildMiddleware } from "@/modules/utils/middleware";
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

  middleware: guildMiddleware,

  async callback(interaction, ctx) {
    const guildModel = ctx.get("guild") as GuildModelJoined;
    const schedule = interaction.options.getString("cron", true);

    const isValid = cron.validate(schedule);
    if (!isValid) {
      throw new AppError(
        "Invalid Cron",
        "Please specify a valid cron string. Refer https://crontab.guru/"
      );
    }

    await guildModel
      .minecraft_server!.$query()
      .patch({ backup_cron: schedule });

    const embed = defaultEmbed()
      .setTitle("✅ Backup Schedule Updated")
      .setDescription(
        `Server backups will now follow ${inlineCode(schedule)} cron schedule`
      )
      .setTimestamp(new Date());

    await interaction.editReply({ embeds: [embed] });
  },
});
