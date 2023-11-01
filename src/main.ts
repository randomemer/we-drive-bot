import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import dotenv from "dotenv";
import WeDriveClient from "./bot";
import ServerSocketManager from "./modules/api/socket";
import "./modules/db";
import { knex } from "./modules/db";
import { PROCESS_STOP_SIGNALS } from "./modules/utils/constants";
import { getInviteURL } from "./modules/utils/functions";
import logger from "./modules/utils/logger";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(duration);

dotenv.config({ path: `env/.env.${process.env.NODE_ENV}` });

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

    // Get Invite URL
    logger.info(getInviteURL());
  } catch (error) {
    logger.error(error, "Failed to initialize client");
    throw error;
  }
}

main();

// Process handling

async function shutdown() {
  // 1. Terminate sockets
  ServerSocketManager.terminateWebsockets();

  // 2. Close database connections
  await knex.destroy();

  // 3. Destroy client
  await client.destroy();
}

PROCESS_STOP_SIGNALS.forEach((signal) => {
  process.on(signal, async () => {
    logger.info(`Received ${signal}. Shutting down gracefully`);
    await shutdown();
    process.exit(0);
  });
});

process.on("unhandledRejection", (error) => {
  logger.error(error);
});

export default client;
