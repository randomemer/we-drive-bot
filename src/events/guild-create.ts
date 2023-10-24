import ServerModel from "@/modules/db/models/server";
import logger from "@/modules/utils/logger";

const config: ListenerConfig<"guildCreate"> = {
  name: "guildCreate",
  async listener(guild) {
    try {
      await ServerModel.query().insert({ id: guild.id });
    } catch (error) {
      logger.error(error);
    }
  },
};

export default config;
