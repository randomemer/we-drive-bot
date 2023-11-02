import BackupManager from "@/modules/api/backups";
import ServerSocketManager from "@/modules/api/socket";
import logger from "@/modules/utils/logger";
import { ActivityType } from "discord.js";

const config: ListenerConfig<"ready"> = {
  name: "ready",
  async listener(client) {
    try {
      // 1. Register slash command
      await client.registerSlashCommands();

      // 2. Init Managers
      await ServerSocketManager.initWebsockets(client);
      await BackupManager.createSchedules(client);

      client.user.presence.set({
        activities: [{ name: "Driving", type: ActivityType.Playing }],
      });
    } catch (error) {
      logger.error(error, "Error running post-ready setup");
    }
  },
};

export default config;
