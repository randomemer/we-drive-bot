import ServerSocketManager from "@/modules/api/socket";
import { BOT_PERMS, BOT_SCOPES } from "@/modules/utils/constants";
import logger from "@/modules/utils/logger";
import { ActivityType } from "discord.js";

const config: ListenerConfig<"ready"> = {
  name: "ready",
  async listener(client) {
    try {
      // 1. Register slash command
      await client.registerSlashCommands();

      // 2. Init Sockets
      await ServerSocketManager.initWebsockets(client);

      client.user.presence.set({
        activities: [{ name: "Driving", type: ActivityType.Playing }],
      });
    } catch (error) {
      logger.error(error, "Error running post-ready setup");
    }
  },
};

export default config;
