exports.up = function (knex) {
    return knex.schema.createTable('questions', (table) => {
        table.increments('question_id').primary();
        table.integer('quest_id').unsigned().notNullable();
        table.foreign('quest_id').references('quest_id').inTable('questionnaires');
        table.text('question_text').notNullable();
        table.enu('type', ['multi_choice', 'text']).notNullable().defaultTo('text');
        table.text('correct_answer');
        table.boolean('requires_review').notNullable().defaultTo(false);
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('questions');
};