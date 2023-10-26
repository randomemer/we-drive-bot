import createKnex from "knex";
import { Model } from "objection";
import ServerModel from "./models/server";
import UserModel from "./models/user";

export const knex = createKnex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    pool: {
      min: 1,
      max: 1,
    },
  },
});

Model.knex(knex);

export default {
  ServerModel,
  UserModel,
};
