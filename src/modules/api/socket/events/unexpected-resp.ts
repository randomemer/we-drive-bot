import ServerModel from "@/modules/db/models/server";
import logger from "@/modules/utils/logger";
import type WebSocket from "ws";

export default function onUnexpectedResp(
  socket: WebSocket,
  server: ServerModel
) {
  socket.on("unexpected-response", (req, res) => {
    let chunks = "";

    res.on("data", (chunk) => {
      chunks += chunk;
    });

    res.on("end", () => {
      logger.info(chunks);
    });
  });
}
