/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('questions', (table) => {
        table.text('answers').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('questions', (table) => {
        table.dropColumn('answers');
    });
};
