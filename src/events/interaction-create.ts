import { getCmdMiddlewares, getExecutableCmd } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
} from "discord.js";
import _ from "lodash";

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

  const context = new Map();

  const chain = getCmdMiddlewares(cmd);

  let isBroken = true;
  for (let i = 0; i < chain.length; i++) {
    const middleware = chain[i];

    isBroken = true;
    await middleware(interaction, context, () => (isBroken = false));
    if (isBroken) return;
  }

  await cmd.callback(interaction, context);
}

async function handleAutocomplete(interaction: AutocompleteInteraction) {
  const cmd = getExecutableCmd(interaction);
  if (!cmd || !cmd.autocomplete) return;
  await cmd.autocomplete(interaction);
}

export default config;
