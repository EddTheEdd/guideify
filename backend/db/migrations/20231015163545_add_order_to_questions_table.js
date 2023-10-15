/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('questions', (table) => {
        table.integer('order').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('questions', (table) => {
        table.dropColumn('order');
    });
};
