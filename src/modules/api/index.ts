import axios from "axios";
import { MAX_BACKUPS } from "@/modules/utils/constants";
import _ from "lodash";
import dayjs from "dayjs";
import logger from "../utils/logger";

const pterodactyl = axios.create({
  baseURL: process.env.PTERODACTYL_API,
  headers: {
    Authorization: `Bearer ${process.env.PTERODACTYL_API_KEY}`,
  },
});

export default pterodactyl;

export async function createBackup(serverId: string) {
  const listResp = await pterodactyl.get<PanelAPIResp<Backup[]>>(
    `servers/${serverId}/backups`
  );

  const backupCount = listResp.data.data.length;

  // Delete backup if limit reached
  if (backupCount === MAX_BACKUPS) {
    const backup = _.minBy(listResp.data.data, (backup) =>
      dayjs(backup.attributes.created_at)
    );

    logger.info(backup);
  }
}
