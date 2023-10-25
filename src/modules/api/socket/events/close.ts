import logger from "@/modules/utils/logger";
import type WebSocket from "ws";
import sockets from "@/modules/api/socket";
import ServerModel from "@/modules/db/models/server";

export default function onClose(socket: WebSocket, server: ServerModel) {
  socket.on("close", (code) => {
    logger.info(`Websocket (${socket.url}) closed with code (${code})`);
    sockets.delete(server.id);
  });
}
