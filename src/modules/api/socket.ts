import pterodactyl from "@/modules/api";
import ServerModel from "@/modules/db/models/server";
import { defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import {
  Channel,
  ChannelType,
  Client,
  MessageCreateOptions,
  roleMention,
} from "discord.js";
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

    logger.info(`Created ${servers.length} pterodactyl sockets`);
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
      this.socket.on("open", this.onOpen.bind(this));
      this.socket.on("message", this.onMessage.bind(this));
      this.socket.on("error", this.onError.bind(this));
      this.socket.on("close", this.onClose.bind(this));
      this.socket.on("unexpected-response", this.onUnexpectedResp.bind(this));

      logger.info(
        `Created websocket (${this.server.id}, ${this.server.mc_server})`
      );
    } catch (error) {
      logger.error(
        error,
        `Failed to create socket (${this.server.id}, ${this.server.mc_server})`
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
    const message: SocketEvent = JSON.parse(json);

    switch (message.event) {
      case "auth success":
        this.onAuthSuccess();
        break;

      case "status":
        this.onStatus(message);
        break;

      case "console output":
        this.onConsoleOutput(message);
        break;

      case "stats":
        this.onStats(message);
        break;

      case "token expiring":
        this.onTokenExpiring();
        break;

      case "token expired":
        this.onTokenExpired();
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

  private async onStatus(message: StatusEvent) {
    const status = message.args[0];

    const channelId = this.server.mc_channel;

    // @TODO : Add a message per day saying this server does not have a default mc channel
    if (!channelId) return;

    let channel: Channel | undefined | null =
      this.client.channels.cache.get(channelId);

    if (!channel) {
      channel = await this.client.channels.fetch(channelId, { force: true });
    }
    if (!channel) return;

    if (channel.type !== ChannelType.GuildText) return;

    const embed = defaultEmbed()
      .setTitle("Server Status")
      .setDescription(`Your server is ${status}`);

    const role = this.server.mc_role;

    const payload: MessageCreateOptions = {
      embeds: [embed],
    };
    if (role && status === "running") {
      payload.content = roleMention(role);
    }
    await channel.send(payload);
  }

  private async onStats(message: StatsEvent) {
    logger.info(message);
  }

  private async onConsoleOutput(message: ConsoleOutputEvent) {
    logger.info(message);
  }

  private async onTokenExpiring() {
    const resp = await pterodactyl.get<SocketDetailsResp>(
      `/servers/${this.server.mc_server}/websocket`
    );

    const data = {
      event: "auth",
      args: [resp.data.data.token],
    };
    this.socket.send(JSON.stringify(data));
  }

  private async onTokenExpired() {
    ServerSocketManager.managers.delete(this.server.id);
    logger.info(
      `Socket auth expired (${this.server.mc_server},${this.server.id})`
    );
  }
}
