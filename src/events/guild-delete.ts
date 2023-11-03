import ServerSocketManager from "@/modules/api/socket";
import { GuildModel } from "@/modules/db";
import logger from "@/modules/utils/logger";

const config: ListenerConfig<"guildDelete"> = {
  name: "guildDelete",
  async listener(guild) {
    try {
      // Delete the record in db
      await GuildModel.query().deleteById(guild.id);

      // Close the server's socket
      const manager = ServerSocketManager.managers.get(guild.id);
      if (manager) manager.close();
    } catch (error) {
      logger.error(error);
    }
  },
};

export default config;
