import ServerSocketManager from "@/modules/api/socket";
import {
  Model,
  ModelObject,
  ModelOptions,
  QueryContext,
  RelationMappings,
  RelationMappingsThunk,
} from "objection";
import ServerModel from "./server";

class GuildModel extends Model {
  id: string;
  mc_role: string | null;
  mc_server: string | null;
  mc_channel: string | null;
  created_at: Date;
  updated_at: Date;

  static idColumn: string | string[] = "id";
  static tableName: string = "guilds";

  static relationMappings: RelationMappings | RelationMappingsThunk = {
    minecraft_server: {
      relation: Model.BelongsToOneRelation,
      modelClass: ServerModel,
      join: {
        from: "guilds.mc_server",
        to: "servers.id",
      },
    },
  };

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
    const old = opt.old as GuildObject | undefined;
    if (!old) return;
    ServerSocketManager.updateWebsocket(old.id, this);
  }

  $afterDelete(queryContext: QueryContext): void | Promise<any> {
    const socketManager = ServerSocketManager.managers.get(this.id);
    if (!socketManager) return;
    socketManager.close();

    // @TODO
  }
}

export type GuildObject = ModelObject<GuildModel>;

export interface GuildModelJoined extends GuildModel {
  minecraft_server?: ServerModel | null | undefined;
}

export default GuildModel;
