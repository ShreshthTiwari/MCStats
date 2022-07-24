const buildDB = require("../sqlite/buildDB.js");
const db = buildDB();

module.exports = async (query) => {
  try{
    if(query){
      db.serialize(() => {
        db.run(query);
      });
    }else{
      console.log("Empty query provided.");
    }
  }catch(error){
    console.log(error);
  }
}