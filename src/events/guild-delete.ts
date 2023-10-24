import ServerModel from "@/modules/db/models/server";
import logger from "@/modules/utils/logger";

const config: ListenerConfig<"guildDelete"> = {
  name: "guildDelete",
  async listener(guild) {
    try {
      await ServerModel.query().deleteById(guild.id);
    } catch (error) {
      logger.error(error);
    }
  },
};

export default config;
