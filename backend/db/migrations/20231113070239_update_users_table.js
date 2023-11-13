/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('users', (table) => {
        table.string("first_name", 255);
        table.string("last_name", 255);
        table.date("date_of_birth");
        table.string("phone_number", 255);
        table
          .integer("department_id")
          .unsigned()
          .references("department_id")
          .inTable("departments");
        table
          .integer("position_id")
          .unsigned()
          .references("position_id")
          .inTable("positions");
    });
};

exports.down = function(knex) {
    return knex.schema.table('users', (table) => {
        table.dropColumn('first_name');
        table.dropColumn('last_name');
        table.dropColumn('date_of_birth');
        table.dropColumn('phone_number');
        table.dropColumn('department_id');
        table.dropColumn('position_id');
    });
};
