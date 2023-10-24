/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  if (!(await knex.schema.hasTable("servers"))) {
    await knex.schema.createTable("servers", (table) => {
      table.string("id").primary();
      table.string("default_server").nullable();
      table.string("minecraft_role").nullable();
      table.datetime("created_at").defaultTo(knex.raw("CURRENT_TIMESTAMP()"));
      table.datetime("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP()"));
    });
  }

  if (!(await knex.schema.hasTable("users"))) {
    await knex.schema.createTable("users", (table) => {
      table.string("id").primary();
      table.string("mc-uuid");
      table.string("mc-name");
      table.string("created_at").defaultTo(knex.raw("CURRENT_TIMESTAMP()"));
      table.string("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP()"));
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("servers");
};
