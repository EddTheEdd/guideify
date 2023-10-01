exports.up = function (knex) {
    return knex.schema.createTable('user_course_progress', (table) => {
        table.increments('progress_id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('id').inTable('users'); 
        table.integer('unit_id').unsigned().notNullable();
        table.foreign('unit_id').references('unit_id').inTable('course_units');
        table.boolean('completed').defaultTo(false);
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('user_course_progress');
};