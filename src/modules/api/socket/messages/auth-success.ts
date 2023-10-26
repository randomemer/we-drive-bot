import ServerModel from "@/modules/db/models/server";
import logger from "@/modules/utils/logger";

export default function onAuthSuccess(event: any, server: ServerModel) {
  logger.info(`Auth success for ${server.mc_server}, ${server.id}`);
}
