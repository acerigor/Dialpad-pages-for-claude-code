const path = require('path');
const { PrismaClient } = require('@prisma/client');

let adapter;

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

if (dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:')) {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const dbPath = dbUrl.startsWith('file:')
    ? path.resolve(__dirname, '..', dbUrl.slice(5))
    : path.resolve(__dirname, '..', dbUrl.slice(7));
  adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
} else {
  const { PrismaPg } = require('@prisma/adapter-pg');
  adapter = new PrismaPg({ connectionString: dbUrl });
}

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
