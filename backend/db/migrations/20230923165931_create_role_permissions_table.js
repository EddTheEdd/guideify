exports.up = function(knex) {
    return knex.schema.createTable('role_permissions', table => {
        table.increments('id').primary();
        table.integer('role_id').unsigned().notNullable();
        table.integer('permission_id').unsigned().notNullable();
        table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
        table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
        table.unique(['role_id', 'permission_id']); // To ensure a unique combination of role_id and permission_id
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('role_permissions');
};
