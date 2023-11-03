import client from "@/main";
import BackupManager from "@/modules/api/backups";
import { Model, ModelObject, ModelOptions, QueryContext } from "objection";

class ServerModel extends Model {
  id: string;
  backup_cron: string | null;
  created_at: Date;
  updated_at: Date;

  static idColumn: string | string[] = "id";
  static tableName: string = "servers";

  $afterInsert(queryContext: QueryContext): void | Promise<any> {
    new BackupManager(client, this);
  }

  $beforeUpdate(
    opt: ModelOptions,
    queryContext: QueryContext
  ): void | Promise<any> {
    this.updated_at = new Date();
  }

  $afterUpdate(
    opt: ModelOptions,
    queryContext: QueryContext
  ): void | Promise<any> {
    const old = opt.old as ServerObject | undefined;
    if (!old) return;
    BackupManager.updateSchedule(old.id, this);
  }

  $afterDelete(queryContext: QueryContext): void | Promise<any> {
    const manager = BackupManager.managers.get(this.id);
    manager?.cleanup();
  }
}

export type ServerObject = ModelObject<ServerModel>;

export default ServerModel;
