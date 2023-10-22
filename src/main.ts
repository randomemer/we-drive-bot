import dotenv from "dotenv";
import WeDriveClient from "./bot";
import "@/modules/db";

dotenv.config();

async function main() {
  try {
    const client = new WeDriveClient({
      intents: ["GuildMessages", "MessageContent", "Guilds"],
    });

    // 1. Login with discord
    await client.login(process.env.BOT_TOKEN);
    console.log("Bot logged in");

    // 3. Register events
    await client.registerEventListeners();
    console.log("Registered event listeners");

    // 4. Register slash commands
    await client.registerSlashCommands();
  } catch (error) {
    console.log("Failed to startup bot");
    console.error(error);
  }
}

main();
