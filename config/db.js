const mysql = require("mysql2/promise");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL no definida");
  process.exit(1);
}

const db = mysql.createPool(process.env.DATABASE_URL);

module.exports = db;
