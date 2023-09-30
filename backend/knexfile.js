// knexfile.js
module.exports = {
    development: {
      client: 'pg',
      connection: {
        host: 'localhost', // PostgreSQL host
        user: 'postgres',
        password: 'qazxswedc123',
        database: 'postgres',
      },
      migrations: {
        directory: './db/migrations', // Specify the directory where your migrations are stored
      },
    },
  };