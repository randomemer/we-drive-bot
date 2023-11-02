/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("servers", (table) => {
    // Default cron schedule to 00:00 every day
    table.string("backup_cron").defaultTo("0 0 * * *");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable("servers", (table) => {
    table.dropColumn("backup_cron");
  });
};
