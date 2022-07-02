let util = require("minecraft-server-util");
let fs = require("fs");

const config = require("../config/config.json");
const messageCleaner = require("../editor/messageCleaner.js");

let defaultLogo = "https://i.ibb.co/NY6KH17/default-icon.png";

module.exports = async (client, ID, IP, port) => {
  let rawData = ["OFFLINE"];

  try{
    rawData = await util.status(IP, port*1, { timeout: 3000 })
      .then((result) => {
        if(result.version.name){              
          return["ONLINE", result.motd.clean, result.version.name, result.players.online, result.players.max, result.players.sample, result.favicon, result.roundTripLatency];
        }else{
          return ["OFFLINE"];
        }
      })
      .catch(() => {});
    
    if(rawData[0] === "ONLINE"){
      rawData[1] = await messageCleaner(rawData[1]) || "NULL";
      
      while(rawData[1].includes("  ")){
        rawData[1] = rawData[1].replace("  ", " ");
      }

      if(rawData[1].startsWith(" ")){
        rawData[1] = rawData[1].slice(1);
      }

      if(rawData[1].endsWith(" ")){
        rawData[1] = rawData[1].slice(0, -1);
      }
      
      rawData[2] = await messageCleaner(rawData[2]) || "NULL";
      rawData[3] = (rawData[3] * 1) || 0;
      rawData[4] = (rawData[4] * 1) || 0;

      let sampleList = rawData[5] || [];
      let slen = sampleList.length || 0;
  
      if(slen > 0){
        for(let i=0; i<=slen-1; i++){
          if(sampleList[i].name){
            sampleList[i] = sampleList[i].name;
          }
        }

        rawData[5] = await messageCleaner(sampleList.join(", "));
      }

      let favicon = rawData[6] || null;
      
      if(favicon){
        favicon = favicon.replace(/^data:image\/png;base64,/, "");
      
        fs.writeFile(`minecraft_stats/src/commands/${ID}.png`, favicon, 'base64', function(){});

        let miscChannel = await client.channels.cache.get(config.miscChannel); 

        if(miscChannel){
          let msg = await miscChannel.send({files: [`minecraft_stats/src/commands/${ID}.png`]});
            
          let imageURL = await msg.attachments.first()?.url;
            
          if(imageURL){
            rawData[6] = imageURL;
          }

          fs.unlink(`minecraft_stats/src/commands/${ID}.png`, () => {});
        }else{
          rawData[6] = defaultLogo;
        }
      }else{
        rawData[6] = defaultLogo;
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