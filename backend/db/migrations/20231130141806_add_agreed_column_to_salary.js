/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('salary_structures', (table) => {
        table.boolean('agreed').defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('salary_structures', (table) => {
        table.dropColumn('agreed');
    });
};
