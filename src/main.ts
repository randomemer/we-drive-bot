import dotenv from "dotenv";
import WeDriveClient from "@/bot";
import "@/modules/db";
import logger from "@/modules/utils/logger";
import { initWebsockets } from "@/modules/api/socket";

dotenv.config();

async function main() {
  try {
    const client = new WeDriveClient({
      intents: ["GuildMessages", "MessageContent", "Guilds"],
    });

    // 1. Init Sockets
    await initWebsockets();

    // 2. Login with discord
    await client.login(process.env.BOT_TOKEN);
    logger.info("Bot logged in");

    // 3. Register events
    await client.registerEventListeners();
    logger.info("Registered event listeners");

    // 4. Register slash commands
    await client.registerSlashCommands();
  } catch (error) {
    logger.error(error, "Failed to startup bot");
  }
}

main();
