import logger from "@/modules/utils/logger";
import type WebSocket from "ws";
import onAuthSuccess from "@/modules/api/socket/messages/auth-success";
import ServerModel from "@/modules/db/models/server";
import pterodactyl from "../..";
import sockets from "..";

export default function onMessage(socket: WebSocket, server: ServerModel) {
  socket.on("message", async (event) => {
    const json = event.toString("utf8");
    const message = JSON.parse(json);

    switch (message.event) {
      case "auth success":
        onAuthSuccess(message, server);
        break;

      case "status":
        break;

      case "token expiring":
        break;

      case "token expired":
        sockets.delete(server.id);
        logger.info(
          `Socket auth expired (${server.default_server},${server.id})`
        );
        break;

      default:
        break;
    }
  });
}
