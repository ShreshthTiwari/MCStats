const samp = require("samp-query");

module.exports = async (IP, port) => {
  let rawData =["OFFLINE"];

  var options = {
    host: IP,
    port: port
  }

  try{
    await new Promise(async (resolve) => {
      samp(options, function(error, response) {
        if(error){
          rawData = ["OFFLINE"];

          resolve(error);
        }else{
          rawData = ["ONLINE", response.hostname, response.gamemode, response.mapname, response.passworded, response.maxplayers, response.online, response.players];
          
          resolve(response);
        }
      });
    });

    if(rawData[0] === "ONLINE"){
      rawData[4] = rawData[4] ? "TRUE" : "FALSE";
  
      let playersList = "";
  
      if(rawData[6] > 0){
        let players = rawData[7] || [];
  
        if(players.length > 0){
          let playerIDs = [];
          let playerNames = [];
          let playerScores = [];
          let playerPings = [];

          if(players.length > 20){
            players.length = 20;
          }

          for(let i=0; i<=players.length-1; i++){
            let player = players[i];

            playerIDs[i] = player.id;
            playerNames[i] = player.name;
            playerScores[i] = player.score;
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

                let pscore = playerScores[j];
                playerScores[j] = playerScores[j+1];
                playerScores[j+1] = pscore;

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

            let playerScore = playerScores[i];
            playerScore += "";
            while(playerScore.length < 4){
              playerScore += " ";
            }

            let playerPing = playerPings[i];
            playerPing += "ms";
            while(playerPing.length < 6){
              playerPing += " ";
            }

            playersList += `${playerID} | ${playerName} | ${playerScore} | ${playerPing}\n`;
          }

          if(rawData[6] > 20){
            playersList += `+${rawData[6] - 20} more...`
          }
        }
      }
  
      if(playersList.length < 1){
        playersList = null;
      }
  
      rawData[7] = playersList;
    }else{
      rawData = ["OFFLINE"];
    }
  }catch(error){
    rawData = ["OFFLINE"];
  }

  return rawData;
}