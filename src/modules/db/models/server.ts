import { Model, ModelObject } from "objection";

class ServerModel extends Model {
  id: string;
  minecraft_role: string | null;
  default_server: string | null;
  created_at: Date;
  updated_at: Date;

  static idColumn: string | string[] = "id";
  static tableName: string = "servers";
}

export type ServerObject = ModelObject<ServerModel>;

export default ServerModel;
