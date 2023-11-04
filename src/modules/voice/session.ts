import { ROOT_DIR } from "@/main";
import { AppError } from "@/modules/utils/errors";
import logger from "@/modules/utils/logger";
import {
  AudioPlayerStatus,
  AudioResource,
  PlayerSubscription,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from "@discordjs/voice";
import {
  MessageCreateOptions,
  MessagePayload,
  TextBasedChannel,
  VoiceBasedChannel,
  bold,
} from "discord.js";
import fs from "fs/promises";
import _ from "lodash";
import path from "path";
import { defaultEmbed } from "../utils/functions";

export default class VoiceSession {
  textChannel: TextBasedChannel;
  voiceChannel: VoiceBasedChannel;

  player = createAudioPlayer();
  connection: VoiceConnection;
  resources: AudioResource[] = [];
  subscription: PlayerSubscription | undefined;

  constructor(voiceChannel: VoiceBasedChannel, textChannel: TextBasedChannel) {
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
  }

  async init() {
    try {
      this.resources = await this.fetchResources();

      this.connection = joinVoiceChannel({
        channelId: this.voiceChannel.id,
        guildId: this.voiceChannel.guildId,
        adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
      });

      // Add connection listeners
      this.connection.on(
        VoiceConnectionStatus.Ready,
        this.onConnected.bind(this)
      );

      this.connection.on(
        VoiceConnectionStatus.Disconnected,
        this.onDisconnected.bind(this)
      );

      this.connection.on("error", this.onConnectionError.bind(this));

      await entersState(this.connection, VoiceConnectionStatus.Ready, 15_000);
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  async fetchResources() {
    const musicDir = `${ROOT_DIR}/assets/music`;
    const fileNames = await fs.readdir(musicDir);
    const resources: AudioResource[] = [];

    for (const fileName of fileNames) {
      const p = path.join(musicDir, fileName);
      const resource = createAudioResource(p, {
        metadata: { title: fileName },
      });
      resources.push(resource);
    }

    return _.shuffle(resources);
  }

  async cleanup() {
    this.subscription?.unsubscribe();
    this.connection?.destroy();
  }

  // =======================
  //  Connection Callbacks
  // =======================

  onConnected() {
    logger.info(`(${this.voiceChannel.guildId}) Voice connected`);

    // Add player callbacks
    this.player.on(AudioPlayerStatus.Idle, this.onIdle.bind(this));
    this.player.on("error", this.onPlayerError.bind(this));

    this.subscription = this.connection.subscribe(this.player);
    if (!this.subscription) throw new AppError();

    this.playNext();
  }

  async onDisconnected() {
    try {
      await Promise.race([
        entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
        entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
      ]);
    } catch {
      logger.info(`(${this.voiceChannel.guildId}) Voice disconnected`);
      await this.cleanup();
    }
  }

  onConnectionError(err: Error) {
    logger.error(err);
    const embed = defaultEmbed().setTitle("⚠ Voice Connection Error");
    this.sendMessage({ embeds: [embed] });

    this.cleanup();
  }

  // =======================
  //  Player Callbacks
  // =======================

  async onIdle() {
    this.playNext();
  }

  playNext() {
    const resource = this.resources.shift();

    if (!resource) {
      const embed = defaultEmbed();
      embed.setDescription(`Finished driving, going home`);
      this.sendMessage({ embeds: [embed] });

      return void this.cleanup();
    }

    const meta = resource.metadata as Record<string, string>;
    const embed = defaultEmbed();
    embed.setDescription(`🎵 Now playing : ${bold(meta.title)}`);
    this.sendMessage({ embeds: [embed] });

    this.player.play(resource);
  }

  async onPlayerError() {
    const embed = defaultEmbed();
    embed.setTitle(`⚠ Playback Error`);
    this.sendMessage({ embeds: [embed] });
    await this.cleanup();
  }

  async sendMessage(content: string | MessagePayload | MessageCreateOptions) {
    this.textChannel.send(content).catch((err) => {
      logger.error(
        err,
        `(${this.voiceChannel.guildId}) Failed to send message`
      );
    });
  }
}
