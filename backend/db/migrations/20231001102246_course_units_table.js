exports.up = function (knex) {
    return knex.schema.createTable('course_units', (table) => {
        table.increments('unit_id').primary();
        table.integer('course_id').unsigned().notNullable();
        table.foreign('course_id').references('course_id').inTable('courses');
        table.string('title').notNullable();
        table.enu('content_type', ['text', 'video', 'quest']).notNullable();
        table.text('content');
        table.integer('quest_id').unsigned();
        table.foreign('quest_id').references('quest_id').inTable('questionnaires');
        table.integer('order').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('course_units');
};