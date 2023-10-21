import { Client } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: ["GuildMessages", "MessageContent", "Guilds"],
});

client.on("ready", () => {
  console.log("Bot is connected");
});

client.on("messageCreate", (msg) => {
  if (msg.content.includes("ping")) msg.reply("Pong");
});

client.login(process.env.BOT_TOKEN);
