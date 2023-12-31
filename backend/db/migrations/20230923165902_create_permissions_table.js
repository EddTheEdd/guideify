exports.up = function(knex) {
    return knex.schema.createTable('permissions', table => {
        table.increments('permission_id').primary();
        table.string('name').notNullable().unique();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('permissions');
};
