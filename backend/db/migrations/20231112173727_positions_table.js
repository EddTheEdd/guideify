/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("positions", (table) => {
    table.increments("position_id").primary();
    table.string("position_title", 255).notNullable().unique();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("positions");
};
