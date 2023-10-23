import createKnex from "knex";

const knex = createKnex({
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

export default knex;
