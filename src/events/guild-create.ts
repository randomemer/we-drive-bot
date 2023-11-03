import { GuildModel } from "@/modules/db";
import logger from "@/modules/utils/logger";

const config: ListenerConfig<"guildCreate"> = {
  name: "guildCreate",
  async listener(guild) {
    try {
      await GuildModel.query().insert({ id: guild.id });
    } catch (error) {
      logger.error(error);
    }
  },
};

export default config;
