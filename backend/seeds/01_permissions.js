/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("permissions").del();
  await knex("permissions").insert([
    { name: "Edit Salaries" },
    { name: "View Salaries" },
    { name: "See All Courses" },
    { name: "View Course Progress" },
    { name: "Review Courses" },
    { name: "Edit Courses" },
    { name: "Edit Roles" },
    { name: "View Roles" },
    { name: "Assign Roles" },
    { name: "Admin Panel" },
  ]);
};
