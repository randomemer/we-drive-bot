import pterodactyl from "@/modules/api";
import ServerModel, { ServerObject } from "@/modules/db/models/server";
import {
  AsyncStatus,
  DataSizes,
  StatusMessage,
} from "@/modules/utils/constants";
import { convertBytes, defaultEmbed } from "@/modules/utils/functions";
import logger from "@/modules/utils/logger";
import dayjs from "dayjs";
import { Channel, Client, Message, codeBlock, roleMention } from "discord.js";
import { ClientRequest, IncomingMessage } from "http";
import { RawData, WebSocket } from "ws";

export default class ServerSocketManager {
  static managers = new Map<string, ServerSocketManager>();

  static async initWebsockets(client: Client) {
    const servers = await ServerModel.query().whereNotNull("mc_server");

    for (const server of servers) {
      new ServerSocketManager(client, server);
    }

    logger.info(`Created ${servers.length} pterodactyl sockets`);
  }

  static updateWebsocket(serverId: string, updated: Partial<ServerObject>) {
    const manager = this.managers.get(serverId);
    if (!manager) return;

    const { server } = manager;

    if (server.mc_role !== updated.mc_role) {
      server.mc_role = updated.mc_role ?? null;
    }

    if (server.mc_channel !== updated.mc_channel) {
      server.mc_channel = updated.mc_channel ?? null;

      manager.stopRealtimeUpdates();
      manager.startRealtimeUpdates();
    }

    if (server.mc_server !== updated.mc_server) {
      manager.close();
      new ServerSocketManager(manager.client, manager.server);
    }
  }

  static closeWebsockets() {
    this.managers.forEach((manager) => manager.close());
  }

  static terminateWebsockets() {
    this.managers.forEach((manager) => manager.terminate());
  }

  client: Client;
  server: ServerModel;

  token: string;
  socket: WebSocket;

  logs: string[] = [];
  status: ServerStatus = "offline";
  stats?: ServerStats | undefined;

  timer: NodeJS.Timeout;

  message?: Message | undefined;
  realtimeUpdateStatus: AsyncStatus = AsyncStatus.Idle;

  constructor(client: Client, server: ServerModel) {
    this.client = client;
    this.server = server;

    this.initSocket();
  }

  private async initSocket() {
    try {
      const resp = await pterodactyl.get<SocketDetailsResp>(
        `/servers/${this.server.mc_server}/websocket`
      );
      this.token = resp.data.data.token;

      this.socket = new WebSocket(resp.data.data.socket, {
        origin: "https://control.sparkedhost.us",
      });

      ServerSocketManager.managers.set(this.server.id, this);

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

  private onOpen() {
    this.sendAuth(this.token);
  }

  private onMessage(event: RawData, isBinary: Boolean) {
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

  private onError(error: Error) {
    logger.error(error, `Websocket error on ${this.socket.url}`);
  }

  private onClose(code: number) {
    logger.info(`Websocket (${this.socket.url}) closed with code (${code})`);
    ServerSocketManager.managers.delete(this.server.id);
  }

  private onUnexpectedResp(req: ClientRequest, res: IncomingMessage) {
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

  private onAuthSuccess() {
    logger.info(
      `Auth success for (${this.server.id}, ${this.server.mc_server})`
    );
  }

  private async onStatus(message: StatusEvent) {
    this.status = message.args[0];
    const channelId = this.server.mc_channel;

    // @TODO : Add a message per day saying this server does not have a default mc channel
    if (!channelId) return;

    let channel: Channel | undefined | null =
      this.client.channels.cache.get(channelId);

    if (!channel) {
      channel = await this.client.channels.fetch(channelId, { force: true });
    }
    if (!channel) return;
    if (!channel.isTextBased()) return;

    if (this.status === "offline") {
      this.stopRealtimeUpdates();
    } else {
      this.startRealtimeUpdates();
    }

    const emoji = this.getStatusEmoji(this.status);
    const role = this.server.mc_role;

    let content = `${emoji} ${StatusMessage[this.status]}`;
    if (!!role && this.status === "running") {
      content = roleMention(role) + " " + content;
    }
    await channel.send(content);
  }

  private onStats(message: StatsEvent) {
    this.stats = JSON.parse(message.args[0]);
  }

  private onConsoleOutput(message: ConsoleOutputEvent) {
    this.logs.push(message.args[0]);
    while (this.logs.length > 10) {
      this.logs.shift();
    }
  }

  private async onTokenExpiring() {
    const resp = await pterodactyl.get<SocketDetailsResp>(
      `/servers/${this.server.mc_server}/websocket`
    );
    this.token = resp.data.data.token;
    this.sendAuth(this.token);
  }

  private onTokenExpired() {
    ServerSocketManager.managers.delete(this.server.id);
    logger.info(
      `Socket auth expired (${this.server.mc_server},${this.server.id})`
    );
  }

  // Socket Commands

  sendAuth(token: string) {
    const data = {
      event: "auth",
      args: [token],
    };
    this.socket.send(JSON.stringify(data));
  }

  sendPowerState(state: any) {
    const data = {
      event: "set state",
      args: [state],
    };
    this.socket.send(JSON.stringify(data));
  }

  close() {
    if (
      this.socket.readyState === WebSocket.CLOSED ||
      this.socket.readyState === WebSocket.CLOSING
    )
      return;
    this.stopRealtimeUpdates();
    this.socket.removeAllListeners();
    this.socket.close();
    ServerSocketManager.managers.delete(this.server.id);
  }

  terminate() {
    this.stopRealtimeUpdates();
    this.socket.removeAllListeners();
    this.socket.terminate();
    ServerSocketManager.managers.delete(this.server.id);
  }

  // Realtime updates

  startRealtimeUpdates() {
    if (!this.server.mc_channel) return;
    if (this.socket.readyState !== WebSocket.OPEN) return;
    if (this.timer) return;

    this.sendUpdate();
    if (this.status !== "offline") {
      this.timer = setInterval(this.sendUpdate.bind(this), 2000);
    }
  }

  stopRealtimeUpdates() {
    clearInterval(this.timer);
    this.message = undefined;
  }

  async sendUpdate() {
    if (!this.stats) return;
    if (this.realtimeUpdateStatus === AsyncStatus.Pending) return;

    try {
      const embed = defaultEmbed();
      const statusEmoji = this.getStatusEmoji(this.stats.state);

      embed.setTitle(`${statusEmoji} Server Status`);

      if (this.logs.length > 0) {
        embed.setDescription(codeBlock(this.logs.join("\n")));
      }

      embed.addFields(
        {
          name: "📊 Status",
          value: this.stats.state,
          inline: true,
        },
        {
          name: "🕛 Uptime",
          value: dayjs
            .duration(this.stats.uptime)
            .format("D [d] H [h] m [m] s [s]"),
          inline: true,
        },
        {
          name: "💻 CPU Usage",
          value: `${this.stats.cpu_absolute} %`,
          inline: true,
        },
        {
          name: "📥 Network RX",
          value:
            convertBytes(this.stats.network.rx_bytes, DataSizes.MEGA_BYTE) +
            ` MiB`,
          inline: true,
        },
        {
          name: "📤 Network TX",
          value:
            convertBytes(this.stats.network.rx_bytes, DataSizes.MEGA_BYTE) +
            " MiB",
          inline: true,
        },
        {
          name: "🧠 Memory Usage",
          value: `${convertBytes(
            this.stats.memory_bytes,
            DataSizes.MEGA_BYTE
          )} MiB / ${convertBytes(
            this.stats.memory_limit_bytes,
            DataSizes.MEGA_BYTE
          )} MiB`,
          inline: true,
        }
      );

      if (!this.message) {
        const channel = await this.client.channels.fetch(
          this.server.mc_channel!
        );

        if (channel?.isTextBased()) {
          this.message = await channel?.send({ embeds: [embed] });
        }
      } else {
        await this.message.edit({ embeds: [embed] });
      }

      this.realtimeUpdateStatus = AsyncStatus.Fulfilled;
    } catch (error) {
      this.realtimeUpdateStatus = AsyncStatus.Rejected;
      logger.error(error);
    }
  }

  // Utils
  getStatusEmoji(status?: ServerStatus) {
    switch (status) {
      case "running":
        return "🏃‍♂️";

      case "offline":
        return "💤";

      case "starting":
        return "🚀";

      case "stopping":
        return "🛑";

      default:
        return "";
    }
  }
}
