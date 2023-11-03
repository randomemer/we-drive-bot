/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 1. Fetch all records
  // const guilds = await knex.select("*").from("servers");
  const guilds = [];

  // 2. Perform DDL queries
  await knex.schema.dropTableIfExists("servers");

  await knex.schema.createTable("servers", (table) => {
    table.string("id").primary();
    table.string("backup_cron").defaultTo("0 0 * * *");
    table
      .datetime("created_at")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP()"));
    table
      .datetime("updated_at")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP()"));
  });

  await knex.schema.createTable("guilds", (table) => {
    table.string("id").primary();
    table.string("mc_channel");
    table.string("mc_role");
    table
      .string("mc_server")
      .references("servers.id")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");

    table
      .datetime("created_at")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP()"));
    table
      .datetime("updated_at")
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP()"));
  });

  // 3. Perform DML queries
  return knex.transaction(async (trx) => {
    const servers = new Map();

    for (const guild of guilds) {
      if (guild.mc_server) {
        servers.set(guild.mc_server, {
          id: guild.mc_servers,
          backup_cron: guild.backup_cron,
        });
      }

      await trx
        .insert({
          id: guild.id,
          mc_channel: guild.mc_channel,
          mc_server: guild.mc_server,
          mc_role: guild.mc_role,
          created_at: guild.created_at,
          updated_at: guild.updated_at,
        })
        .into("guilds");
    }

    for (const server of servers.values()) {
      await trx.insert(server).into("servers");
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("guilds");
  await knex.schema.dropTable("servers");
};
