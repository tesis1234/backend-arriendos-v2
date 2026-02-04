const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQL_HOST,
  port: Number(process.env.DB_PORT || process.env.MYSQL_PORT),
  user: process.env.DB_USER || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;

