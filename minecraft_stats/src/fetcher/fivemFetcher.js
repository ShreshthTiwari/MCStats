let fivem = require("fivem");
let fs = require("fs");

const config = require("../config/config.json");

let defaultLogoFivem = "https://i.imgur.com/w4RuVUC.png";

module.exports = async (client, ID, IP, port) => {
  let rawData = ["OFFLINE"];

  try{
    const srv = new fivem.Server(`${IP}:${port}`);

    rawData = await srv.getServer()
      .then((result) => {
        return["ONLINE", result.icon, result.vars.banner_connecting, result.vars.locale, result.vars.sv_maxClients, result.vars.sv_projectDesc, result.vars.sv_projectName, result.vars.tags];
      })
      .catch(() => {});
    
    if(rawData[0] === "ONLINE"){
      rawData[rawData.length] = await srv.getPlayers()
        .then((result) => {
          return result;
        }) || 0;

      let playersList = "";

      if(rawData[rawData.length-1] > 0){
        let players = await srv.getPlayersAll()
          .then((result) => {
            return result;
          }) || [];

        if(players.length > 0){
          let playerIDs = [];
          let playerNames = [];
          let playerPings = [];

          if(players.length > 20){
            players.length = 20;
          }

          for(let i=0; i<=players.length-1; i++){
            let player = players[i];

            playerIDs[i] = player.id;
            playerNames[i] = player.name;
            playerPings[i] = player.ping;
          }

          for(let i=0; i<=playerIDs.length-1; i++){
            for(let j=0; j<=playerIDs.length-1-i; j++){
              if(playerIDs[j] > playerIDs[j+1]){
                let pid = playerIDs[j];
                playerIDs[j] = playerIDs[j+1];
                playerIDs[j+1] = pid;

                let pname = playerNames[j];
                playerNames[j] = playerNames[j+1];
                playerNames[j+1] = pname;

                let pping = playerPings[j];
                playerPings[j] = playerPings[j+1];
                playerPings[j+1] = pping;
              }
            }
          }

          for(let i=0; i<=playerIDs.length-1; i++){
            let playerID = playerIDs[i];
            playerID += "";
            while(playerID.length < 2){
              playerID = " " + playerID;
            }

            let playerName = playerNames[i];
            while(playerName.length < 18){
              playerName += " ";
            }

            if(playerName.length > 18){
              playerName.length = 18;
            }

            let playerPing = playerPings[i];
            playerPing += "ms";
            while(playerPing.length < 6){
              playerPing += " ";
            }

            playersList += `${playerID} | ${playerName} | ${playerPing}\n`;
          }

          if(rawData[rawData.length - 1] > 20){
            playersList += `+${rawData[rawData.length - 1] - 20} more...`
          }
        }
      }

      if(playersList.length < 1){
        playersList = null;
      }

      rawData[rawData.length] = playersList;

      let favicon = rawData[1] || null;
      
      if(favicon){
        favicon = favicon.replace(/^data:image\/png;base64,/, "");
      
        fs.writeFile(`minecraft_stats/src/cache/${ID}.png`, favicon, 'base64', function(){});

        let miscChannel = await client.channels.cache.get(config.miscChannel); 

        if(miscChannel){
          let msg = await miscChannel.send({files: [`minecraft_stats/src/cache/${ID}.png`]});
            
          let imageURL = await msg.attachments.first()?.url;
            
          if(imageURL){
            rawData[1] = imageURL || defaultLogoFivem;
          }

          fs.unlink(`minecraft_stats/src/cache/${ID}.png`, () => {});
        }else{
          rawData[1] = defaultLogoFivem;
        }
      }else{
        rawData[1] = defaultLogoFivem;
      }

      if(rawData[5] && (rawData[5].length > 1000)){
        rawData[5].length = 997;
        rawData[5] += "...";
      }

      if(rawData[7]){
        let tagsList = "";
        let tags = rawData[7].split(", ");
        let len = tags.length;
        let count = 1;

        if(len > 20){
          len = 20;
        }

        for(let i=0; i<=len-1; i++){
          let tag = tags[i];

          tag = `${count}. ${tag}`;

          while(tag.length < 12){
            tag += " ";
          }

          if(tag.length > 12){
            tag = tag.slice(0, 12-tag.length);
          }

          tagsList += `${tag} | `;

          if(count % 2 == 0){
            tagsList += "\n";
          }

          count++;
        }

        if(tags.length > 20){
          tagsList += `+${tags.length - 20} more...`;
        }

        rawData[7] = tagsList;

        if(rawData[7] === ""){
          rawData[7] = null;
        }
      }
    }else{
      rawData = ["OFFLINE"];
    }
  }catch{
    rawData = ["OFFLINE"];
  }

  return rawData;
}