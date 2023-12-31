exports.up = function (knex) {
    return knex.schema.createTable('courses', (table) => {
        table.increments('course_id').primary();
        table.string('name').notNullable().unique();
        table.text('description').notNullable();
        table.string('rgb_value');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('courses');
};