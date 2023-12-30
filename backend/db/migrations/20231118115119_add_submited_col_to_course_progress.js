/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('user_unit_progress', (table) => {
        table.boolean('submitted').defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('user_unit_progress', (table) => {
        table.dropColumn('submitted');
    });
};
