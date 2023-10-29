import ServerSocketManager from "@/modules/api/socket";
import ServerModel from "@/modules/db/models/server";
import logger from "@/modules/utils/logger";

const config: ListenerConfig<"guildDelete"> = {
  name: "guildDelete",
  async listener(guild) {
    try {
      await ServerModel.query().deleteById(guild.id);

      const manager = ServerSocketManager.managers.get(guild.id);
      if (manager) {
        manager.close();
      }
    } catch (error) {
      logger.error(error);
    }
  },
};

export default config;
