exports.up = function(knex) {
    return knex.schema.createTable('user_answers', table => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.integer('question_id').unsigned().notNullable();
        table.foreign('question_id').references('question_id').inTable('questions').onDelete('CASCADE');
        table.text('answer').notNullable();
        table.boolean('is_correct').nullable();
        table.boolean('is_reviewed').notNullable().defaultTo(false);
        table.timestamps(true, true);

        table.unique(['user_id', 'question_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('user_answers');
};