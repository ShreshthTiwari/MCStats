const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("minecraft_stats/src/database/db.sqlite");

module.exports = () => {
  return db;
}