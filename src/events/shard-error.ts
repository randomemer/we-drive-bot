import logger from "@/modules/utils/logger";

const config: ListenerConfig<"shardError"> = {
  name: "shardError",
  listener(error, shardId) {
    logger.error(
      error,
      `A websocket connection (${shardId}) encountered an error`
    );
  },
};

export default config;
