let util = require("minecraft-server-util");

const messageCleaner = require("../editor/messageCleaner.js");

module.exports = async (IP, port) => {
  let rawData = ["OFFLINE"];

  try{
    rawData = util.queryFull(IP, port*1, { timeout: 500 })
      .then((result) => {
        if(result.version){
          return["ONLINE", result.players.list];
        }else{
          return ["OFFLINE"];
        }
      })
      .catch((error) => {});
    
    if(rawData[0] === "ONLINE"){
      let playersList = rawData[1] || [];
               
      if(playersList.length && playersList.length > 20){
        playersList.length = 21;
        playersList[20] = `+${playersList.length-20} more`;
      }

      playersList = await messageCleaner(playersList.join(", "));
      rawData[1] = playersList;
    }else{
      rawData = ["OFFLINE"];
    }

    return rawData;
  }catch{
    rawData = ["OFFLINE"];
    
    return rawData;
  }
}