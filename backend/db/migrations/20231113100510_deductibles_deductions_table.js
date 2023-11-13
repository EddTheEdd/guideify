/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("salary_deductibles", (table) => {
    table.increments("id").primary();
    table
      .integer("salary_id")
      .unsigned()
      .references("salary_id")
      .inTable("salary_structures")
      .onDelete("CASCADE");
    table
      .integer("deductible_id")
      .unsigned()
      .references("deductible_id")
      .inTable("deductibles")
      .onDelete("CASCADE");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("salary_deductibles");
};
