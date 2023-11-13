/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("deductibles", (table) => {
    table.increments("deductible_id").primary();
    table.string("name").notNullable();
    table.decimal("amount", 14, 2);
    table.decimal("percentage", 5, 2);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("deductibles");
};
