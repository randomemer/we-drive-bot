// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "mysql2",
    connection: {
      user: "root",
      host: process.env.DB_HOST,
      database: process.env.MYSQL_DATABASE,
      password: process.env.MYSQL_ROOT_PASSWORD,
    },
    migrations: {
      directory: "./knex/migrations",
    },
    seeds: {
      directory: "./knex/seeds",
    },
  },

  production: {
    client: "mysql2",
    connection: {
      user: "root",
      host: process.env.DB_HOST,
      database: process.env.MYSQL_DATABASE,
      password: process.env.MYSQL_ROOT_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
