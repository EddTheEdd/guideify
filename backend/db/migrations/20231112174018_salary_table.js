/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("salary_structures", (table) => {
    table.increments("salary_id").primary();
    table
      .integer("user_id")
      .unsigned()
      .references("user_id")
      .inTable("users");
    table.decimal("base_salary", 14, 2);
    table.decimal("bonus", 14, 2).defaultTo(0);
    table.decimal("allowance", 14, 2).defaultTo(0);
    table.timestamps(true, true);

  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("salary_structures");
};
