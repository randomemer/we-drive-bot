import ServerSocketManager from "@/modules/api/socket";
import logger from "@/modules/utils/logger";

const config: ListenerConfig<"ready"> = {
  name: "ready",
  async listener(client) {
    try {
      // 1. Register slash commands
      await client.registerSlashCommands();

      // 2. Init Sockets
      await ServerSocketManager.initWebsockets(client);
    } catch (error) {
      logger.error(error, "Error running post-ready setup");
    }
  },
};

export default config;
