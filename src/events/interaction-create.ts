import WeDriveClient from "@/bot";

const config: ListenerConfig<"interactionCreate"> = {
  name: "interactionCreate",
  listener: async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply({ ephemeral: true });
    const client = interaction.client as WeDriveClient;

    const botCommand = client.slashCommands.get(interaction.commandName);
    if (!botCommand) {
      interaction.reply("No such bot command found");
      return;
    }

    // with only subcommands
    const subCmdName = interaction.options.getSubcommand();
    if (subCmdName && "subCommands" in botCommand) {
      const subCmd = botCommand.subCommands!.get(subCmdName);
      await subCmd?.callback(interaction);
    }

    // with subcommand groups @TODO
    const subCmdGroup = interaction.options.getSubcommandGroup();
    if (subCmdGroup) {
    }
  },
};

export default config;
