/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("salary_history", (table) => {
    table.increments("history_id").primary();
    table
      .integer("salary_id")
      .unsigned()
      .references("salary_id")
      .inTable("salary_structures");
    table.date("effective_date").notNullable();
    table.decimal("old_salary", 14, 2);
    table.decimal("new_salary", 14, 2);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("salary_history");
};
