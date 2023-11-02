import BackupManager from "@/modules/api/backups";
import ServerSocketManager from "@/modules/api/socket";
import { Model, ModelObject, ModelOptions, QueryContext } from "objection";

class ServerModel extends Model {
  id: string;
  mc_role: string | null;
  mc_server: string | null;
  mc_channel: string | null;
  backup_cron: string | null;
  created_at: Date;
  updated_at: Date;

  static idColumn: string | string[] = "id";
  static tableName: string = "servers";

  $afterUpdate(
    opt: ModelOptions,
    queryContext: QueryContext
  ): void | Promise<any> {
    const old = opt.old as ServerObject | undefined;
    if (!old) return;
    ServerSocketManager.updateWebsocket(old.id, this);
    BackupManager.updateSchedule(old.id, this);
  }

  $afterDelete(queryContext: QueryContext): void | Promise<any> {
    const manager = ServerSocketManager.managers.get(this.id);
    if (!manager) return;
    manager.close();
  }
}

export type ServerObject = ModelObject<ServerModel>;

export default ServerModel;
