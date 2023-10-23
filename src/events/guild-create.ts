import knex from "@/modules/db";
import logger from "@/modules/utils/logger";

const config: ListenerConfig<"guildCreate"> = {
  name: "guildCreate",
  async listener(guild) {
    try {
      // knex.select("*").from("servers");
    } catch (error) {
      logger.error(error);
    }
  },
};

export default config;
