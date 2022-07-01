const mcdata = require("mcdata");

module.exports = async (uuid) => {
  try{
    let name = await mcdata.player.getUsername(uuid);
  
    return name;
  }catch(error){
    console.log(error);
  }
}