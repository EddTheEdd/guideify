/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('salary_structures', (table) => {
        table.boolean('signed').defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('salary_structures', (table) => {
        table.dropColumn('signed');
    });
};
