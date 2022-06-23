const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("minecraft_stats/src/database/database.sqlite");

module.exports = () => {
  try{
    return db;
  }catch(error){
    errorLogger(client, null, error, "src/events/buildDB.js : 8");
  }
}