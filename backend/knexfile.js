
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
      directory: "./db/migrations",
    },
  },
  production: {
    client: "pg",
    connection: {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: "./db/migrations",
    },
    pool: {
      min: 2,
      max: 10
    },
  }
};
