
console.log(process.env.DB_USER);
// knexfile.js

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: PGHOST,
      user: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE,
    },
    migrations: {
      directory: "./db/migrations",
    },
  },
  production: {
    client: "pg",
    connection: {
      host: PGHOST,
      user: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE,
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
