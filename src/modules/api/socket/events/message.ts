import logger from "@/modules/utils/logger";
import type WebSocket from "ws";
import onAuthSuccess from "@/modules/api/socket/messages/auth-success";
import ServerModel from "@/modules/db/models/server";
import pterodactyl from "@/modules/api";
import sockets from "@/modules/api/socket";

export default function onMessage(socket: WebSocket, server: ServerModel) {
  socket.on("message", async (event) => {
    const json = event.toString("utf8");
    const message = JSON.parse(json);

    switch (message.event) {
      case "auth success": {
        onAuthSuccess(message, server);
        break;
      }

      case "status":
        logger.info(message);
        break;

      case "token expiring": {
        const resp = await pterodactyl.get<SocketDetailsResp>(
          `/servers/${server.mc_server}/websocket`
        );

        const data = {
          event: "auth",
          args: [resp.data.data.token],
        };
        socket.send(JSON.stringify(data));
        break;
      }

      case "token expired": {
        sockets.delete(server.id);
        logger.info(`Socket auth expired (${server.mc_server},${server.id})`);
        break;
      }

      default:
        break;
    }
  });
}
