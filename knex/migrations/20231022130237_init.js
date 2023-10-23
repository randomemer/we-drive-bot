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
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable("servers");
};
