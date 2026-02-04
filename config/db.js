const mysql = require("mysql2/promise");

if (!process.env.MYSQL_URL) {
  console.error("❌ MYSQL_URL no está definida en Railway");
}

const db = mysql.createPool(process.env.MYSQL_URL);

module.exports = db;

