/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('user_roles', (table) => {
      table.increments('user_role_id').primary();
      table.integer('user_id').unsigned().references('user_id').inTable('users').onDelete('CASCADE');
      table.integer('role_id').unsigned().references('role_id').inTable('roles').onDelete('CASCADE');
      table.timestamps(true, true);
      // Add any other columns you need for user-role relations
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_roles');
};