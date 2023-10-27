import { getExecutableCmd } from "@/modules/utils/functions";
import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
} from "discord.js";

const config: ListenerConfig<"interactionCreate"> = {
  name: "interactionCreate",
  listener: async (interaction) => {
    if (interaction.isChatInputCommand()) handleChatInput(interaction);
    if (interaction.isAutocomplete()) handleAutocomplete(interaction);
  },
};

async function handleChatInput(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  await interaction.deferReply();
  const cmd = getExecutableCmd(interaction);

  if (!cmd) {
    await interaction.editReply("No such bot command found");
    return;
  }

  cmd.callback(interaction);
}

async function handleAutocomplete(interaction: AutocompleteInteraction) {
  const cmd = getExecutableCmd(interaction);
  if (!cmd || !cmd.autocomplete) return;
  await cmd.autocomplete(interaction);
}

export default config;
