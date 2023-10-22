import createKnex from "knex";

const knex = createKnex({
  client: "mysql2",
  connection: {
    host: "db",
    port: 3306,
    user: "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    pool: {
      min: 1,
      max: 1,
    },
  },
});

export default knex;
