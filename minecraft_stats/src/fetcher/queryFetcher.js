let util = require("minecraft-server-util");

const messageCleaner = require("../editor/messageCleaner.js");

module.exports = async (client, IP, port) => {
  let rawData = ["OFFLINE"];

  try{
    rawData = util.queryFull(IP, port, { timeout: 2000 })
      .then((result) => {
        if(result.version){
          if(result.players.max == '0'){
            return ["OFFLINE"];
          }
              
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
    }

    return rawData;
  }catch{
    return rawData;
  }
}