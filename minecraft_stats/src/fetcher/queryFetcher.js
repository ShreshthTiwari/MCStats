let util = require("minecraft-server-util");

const messageCleaner = require("../editor/messageCleaner.js");

module.exports = async (IP, port) => {
  let rawData = ["OFFLINE"];

  try{
    rawData = util.queryFull(IP, port*1, { timeout: 5000 })
      .then((result) => {
        if(result.version){
          return["ONLINE", result.players.list];
        }else{
          return ["OFFLINE"];
        }
      })
      .catch(() => {});
    
    if(rawData[0] === "ONLINE"){
      let playersList = rawData[1] || [];

      if(playersList.length > 0){
        rawData[1] = await messageCleaner(playersList.join(", "));
      }else{
        rawData = ["OFFLINE"];
      }
    }else{
      rawData = ["OFFLINE"];
    }

    return rawData;
  }catch{
    rawData = ["OFFLINE"];
    
    return rawData;
  }
}