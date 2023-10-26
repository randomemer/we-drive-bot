import { WebSocket } from "ws";
import ServerModel from "@/modules/db/models/server";
import logger from "@/modules/utils/logger";
import pterodactyl from "@/modules/api";
import onOpen from "./events/open";
import onMessage from "./events/message";
import onClose from "./events/close";
import onError from "./events/error";
import onUnexpectedResp from "./events/unexpected-resp";

const sockets = new Map<string, WebSocket>();

export async function initWebsockets() {
  // 1. Fetch all servers
  const servers = await ServerModel.query().whereNotNull("default_server");

  // 2. Create sockets for each server
  for (const server of servers) {
    try {
      await createWebsocket(server);
      logger.info(
        `Created websocket for discord server ${server.id}, pterodactyl server : ${server.default_server}`
      );
    } catch (error) {
      logger.error(
        error,
        `Failed to create socket for discord server ${server.id}, pterodactyl server : ${server.default_server}`
      );
    }
  }
}

async function createWebsocket(server: ServerModel) {
  // 1. Fetch the socker details
  const resp = await pterodactyl.get<SocketDetailsResp>(
    `/servers/${server.default_server}/websocket`
  );

  // 2. Create a socket
  const socket = new WebSocket(resp.data.data.socket, {
    origin: "https://control.sparkedhost.us",
  });
  sockets.set(server.id, socket);

  // 3. Configure listeners
  onOpen(socket, resp.data.data.token);
  onMessage(socket, server);
  onError(socket);
  onClose(socket, server);
  onUnexpectedResp(socket, server);
}

export default sockets;
