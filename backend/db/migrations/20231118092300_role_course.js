/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('roles_courses', (table) => {
      table.increments('role_course_id').primary();
      table.integer('role_id').unsigned().references('role_id').inTable('roles').onDelete('CASCADE');
      table.integer('course_id').unsigned().references('course_id').inTable('courses').onDelete('CASCADE');
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('roles_courses');
};