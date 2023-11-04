/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('user_course_progress', (table) => {
        table.unique(['user_id', 'unit_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.table('user_course_progress', (table) => {
        table.dropUnique(['user_id', 'unit_id']);
    });
};