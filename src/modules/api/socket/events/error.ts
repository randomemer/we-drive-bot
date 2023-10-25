import logger from "@/modules/utils/logger";
import type WebSocket from "ws";

export default function onError(socket: WebSocket) {
  socket.on("error", (error) => {
    logger.error(error, `Websocket error on ${socket.url}`);
  });
}
