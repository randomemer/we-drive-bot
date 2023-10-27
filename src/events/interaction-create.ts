const config: ListenerConfig<"interactionCreate"> = {
  name: "interactionCreate",
  listener: async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply();
    const client = interaction.client;

    const botCommand = client.slashCommands.get(interaction.commandName);
    if (!botCommand) {
      await interaction.editReply("No such bot command found");
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
    if (subCmdGroup && "subCommandGroups" in botCommand) {
      botCommand.subCommandGroups?.get("");
    }
  },
};

export default config;
