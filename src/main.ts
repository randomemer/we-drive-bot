import WeDriveClient from "@/bot";
import ServerSocketManager from "@/modules/api/socket";
import "@/modules/db";
import { knex } from "@/modules/db";
import logger from "@/modules/utils/logger";
import dotenv from "dotenv";

dotenv.config();

const client = new WeDriveClient({
  intents: ["GuildMessages", "MessageContent", "Guilds"],
});

async function main() {
  try {
    // Login with discord
    await client.login(process.env.BOT_TOKEN);
    logger.info("Bot logged in");

    // Register events
    await client.registerEventListeners();
    logger.info("Registered event listeners");
  } catch (error) {
    logger.error(error, "Failed to initialize client");
  }
}

main();

// Process handling

async function shutdown() {
  // 1. Terminate sockets
  ServerSocketManager.closeWebsockets();

  // 2. Close database connections
  await knex.destroy();

  // 3. Destroy client
  await client.destroy();
}

process.on("SIGINT", async () => {
  logger.info("Received SIGINT. Shutting down gracefully");
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM. Shutting down gracefully");
  await shutdown();
  process.exit(0);
});

export default client;
