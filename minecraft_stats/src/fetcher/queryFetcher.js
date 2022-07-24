let util = require("minecraft-server-util");

const messageCleaner = require("../editor/messageCleaner.js");

async function isValidUsername(Username){
  if(Username.length < 3 || Username.length > 16){
    return false;
  }

  return /^[A-Za-z0-9_]*$/.test(Username);
}

module.exports = async (IP, port) => {
  let rawData = ["OFFLINE"];

  try{
    rawData = util.queryFull(IP, port*1, { timeout: 7000 })
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
      let len = playersList.length;

      if(len > 20){
        len = 20;
      }

      if(len > 0){
        let pList = "";
        let count = 1;

        for(let i=0; i<=len-1; i++){
          let name = playersList[i];

          if(await isValidUsername(name)){
            while(name.length < 16){
              name += " ";
            }
            
            pList += `${count}. ` + name + " | ";

            if(count % 2 == 0){
              pList += "\n";
            }

            count++;
          }
        }

        if(playersList.length > 20){
          pList += `+${playersList.length - 20} more...`
        }

        rawData[1] = await messageCleaner(pList);
      }else{
        rawData = ["OFFLINE"];
      }
    }else{
      rawData = ["OFFLINE"];
    }
  }catch{
    rawData = ["OFFLINE"];
  }
    
  return rawData;
}