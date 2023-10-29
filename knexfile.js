const dotenv = require("dotenv");

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  dev: {
    client: "mysql2",
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: "./knex/migrations",
    },
    seeds: {
      directory: "./knex/seeds",
    },
  },

  prod: {
    client: "mysql2",
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./knex/migrations",
    },
    seeds: {
      directory: "./knex/seeds",
    },
  },
};
