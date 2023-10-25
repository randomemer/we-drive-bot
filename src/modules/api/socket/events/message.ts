import logger from "@/modules/utils/logger";
import type WebSocket from "ws";

export default function onMessage(socket: WebSocket) {
  socket.on("message", async (event) => {
    console.log(event);
    const json = event.toString("utf8");
    const message = JSON.parse(json);
    logger.info(message);
  });
}
