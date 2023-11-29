// const dotenv = require("dotenv");

// dotenv.config();
console.log(process.env.DB_USER);
// knexfile.js
module.exports = {
  development: {
    client: "pg",
    connection: {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: "./db/migrations", // Specify the directory where your migrations are stored
    },
  },
};
