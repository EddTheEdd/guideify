exports.up = function (knex) {
    return knex.schema.createTable('questionnaires', (table) => {
        table.increments('quest_id').primary();
        table.string('title').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('questionnaires');
};