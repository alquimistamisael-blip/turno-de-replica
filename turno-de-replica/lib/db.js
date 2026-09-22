const { neon } = require('@neondatabase/serverless');

function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada');
  }
  return neon(process.env.DATABASE_URL);
}

module.exports = { getDatabase };
