exports.up = function (knex) {
    return knex.schema.createTable('user_unit_progress', (table) => {
        table.increments('progress_id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('user_id').inTable('users'); 
        table.integer('unit_id').unsigned().notNullable();
        table.foreign('unit_id').references('unit_id').inTable('units');
        table.boolean('completed').defaultTo(false);
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('user_unit_progress');
};