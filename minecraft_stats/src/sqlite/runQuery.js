const buildDB = require("../sqlite/buildDB.js");
const db = buildDB();

module.exports = async (query) => {
  if(query){
    db.serialize(() => {
      db.run(query);
    });
  }else{
    return;
  }

  return;
}