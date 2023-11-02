/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('course_units', (table) => {
        table.text('description').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('course_units', (table) => {
        table.dropColumn('description');
    });
};
