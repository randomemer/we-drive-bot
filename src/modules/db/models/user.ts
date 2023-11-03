import { Model, ModelObject, ModelOptions, QueryContext } from "objection";

class UserModel extends Model {
  id: string;
  mc_name: string | null;
  mc_uuid: string | null;
  created_at: Date;
  updated_at: Date;

  static idColumn: string | string[] = "id";
  static tableName: string = "users";

  $afterUpdate(
    opt: ModelOptions,
    queryContext: QueryContext
  ): void | Promise<any> {
    this.updated_at = new Date();
  }
}

export type UserObject = ModelObject<UserModel>;

export default UserModel;
