import logger from "@/modules/utils/logger";

const config: ListenerConfig<"error"> = {
  name: "error",
  listener(error) {
    logger.error(error);
  },
};

export default config;
