const buildDB = require("../sqlite/buildDB.js");
const db = buildDB();

module.exports = async (query) => {
  try{
    if(query){
      db.serialize(() => {
        db.run(query);
      });
    }
  }catch(error){
    console.log(error);
  }
}