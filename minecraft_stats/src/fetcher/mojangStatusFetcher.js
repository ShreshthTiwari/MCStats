const mcdata = require("mcdata");

module.exports = async () => {
  try{
    let status = await mcdata.mojangStatus();
  
    return status;
  }catch(error){
    console.log(error);
  }
}