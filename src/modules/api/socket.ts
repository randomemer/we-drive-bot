import pterodactyl from "@/modules/api";
import ServerModel from "@/modules/db/models/server";
import logger from "@/modules/utils/logger";
import { Client } from "discord.js";
import { ClientRequest, IncomingMessage } from "http";
import { RawData, WebSocket } from "ws";

export default class ServerSocketManager {
  static managers = new Map<string, ServerSocketManager>();

  static async initWebsockets(client: Client) {
    const servers = await ServerModel.query().whereNotNull("mc_server");

    for (const server of servers) {
      const manager = new ServerSocketManager(client, server);
      this.managers.set(server.id, manager);
    }
  }

  static closeWebsockets() {
    this.managers.forEach((manager) => {
      manager.socket.removeAllListeners();

      if (
        manager.socket.readyState === WebSocket.CLOSING ||
        manager.socket.readyState === WebSocket.CLOSED
      ) {
        return;
      }

      manager.socket.terminate();
    });
  }

  client: Client;
  server: ServerModel;

  token: string;
  socket: WebSocket;

  constructor(client: Client, server: ServerModel) {
    this.client = client;
    this.server = server;

    this.initSocket();
  }

  async initSocket() {
    try {
      const resp = await pterodactyl.get<SocketDetailsResp>(
        `/servers/${this.server.mc_server}/websocket`
      );
      this.token = resp.data.data.token;

      this.socket = new WebSocket(resp.data.data.socket, {
        origin: "https://control.sparkedhost.us",
      });

      // Hook up event listener
      this.socket.on("open", this.onOpen);
      this.socket.on("message", this.onMessage);
      this.socket.on("error", this.onError);
      this.socket.on("close", this.onClose);
      this.socket.on("unexpected-response", this.onUnexpectedResp);

      logger.info(
        `Created websocket for discord server ${this.server.id}, pterodactyl server : ${this.server.mc_server}`
      );
    } catch (error) {
      logger.error(
        error,
        `Failed to create socket for discord server ${this.server.id}, pterodactyl server : ${this.server.mc_server}`
      );
    }
  }

  // Socket event handlers

  private async onOpen() {
    const data = {
      event: "auth",
      args: [this.token],
    };

    this.socket.send(JSON.stringify(data));
  }

  private async onMessage(event: RawData, isBinary: Boolean) {
    const json = event.toString("utf8");
    const message = JSON.parse(json);

    switch (message.type) {
      case "auth success":
        this.onAuthSuccess();
        break;

      case "auth expiring":
        this.onAuthExpiring();
        break;

      case "auth expired":
        this.onAuthExpired();
        break;

      default:
        break;
    }
  }

  private async onError(error: Error) {
    logger.error(error, `Websocket error on ${this.socket.url}`);
  }

  private async onClose(code: number) {
    logger.info(`Websocket (${this.socket.url}) closed with code (${code})`);
    ServerSocketManager.managers.delete(this.server.id);
  }

  private async onUnexpectedResp(req: ClientRequest, res: IncomingMessage) {
    let chunks = "";

    res.on("data", (chunk) => {
      chunks += chunk;
    });

    res.on("end", () => {
      logger.warn(
        chunks,
        `Unexpected response on socket manager (${this.server.mc_server}, ${this.server.id})`
      );
    });
  }

  // Message handlers

  private async onAuthSuccess() {
    logger.info(
      `Auth success for (${this.server.id}, ${this.server.mc_server})`
    );
  }

  private async onAuthExpiring() {
    const resp = await pterodactyl.get<SocketDetailsResp>(
      `/servers/${this.server.mc_server}/websocket`
    );

    const data = {
      event: "auth",
      args: [resp.data.data.token],
    };
    this.socket.send(JSON.stringify(data));
  }

  private async onAuthExpired() {
    ServerSocketManager.managers.delete(this.server.id);
    logger.info(
      `Socket auth expired (${this.server.mc_server},${this.server.id})`
    );
  }
}
