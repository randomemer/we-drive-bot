import createKnex from "knex";
import { Model } from "objection";
import ServerModel from "./models/server";
import UserModel from "./models/user";

export const knex = createKnex({
  client: "mysql2",
  connection: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
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
