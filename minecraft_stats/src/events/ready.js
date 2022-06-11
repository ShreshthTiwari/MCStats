const chalk = require("chalk");

let defaultLogo = "https://i.ibb.co/NY6KH17/default-icon.png";

const javaFetcher = require("../fetcher/javaFetcher.js");
const queryFetcher = require("../fetcher/queryFetcher.js");
const bedrockFetcher = require("../fetcher/bedrockFetcher.js");

const emojisFetcher = require("../fetcher/emojisFetcher.js");

let time;
let guildsMap;
let guildsCount;
let database;
let count = 1;
let interval = 10;

let serversData = {};

let errors = 0;
let success = 0;

let totalTime = 50;

module.exports = {
  name: 'ready',
  once: true,
  async execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger) {
    let statusEmbed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    const line = "-----------------------------------------------------------------------------------------------------------------------";

    time = new Date();

    guildsMap = await client.guilds.cache
      .sort((guild1, guild2) => guild2.memberCount - guild1.memberCount)
      .map(guild => guild);

    guildsCount = guildsMap.length;
    guilds = guildsMap.length;
    //interval = Math.round(Math.round(guildsCount/50) + 0.4);

    try{
      await client.user.setActivity(`For /help in ${guildsCount} ${guildsCount > 1 ? "servers" : "server"}`, {type: "WATCHING"});
    }catch(error){
      await errorLogger(client, null, error, "src/commands/ready.js : 45");
    }

    const emojis = await emojisFetcher(client);

    const grass = emojis.grass;
    const wifi = emojis.wifi;
    const settings = emojis.settings;
    const users = emojis.users;
    const pen = emojis.pen;
    const signal = emojis.signal;
    
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);
    
    let cross = "❌";
      
    console.log(`${line}\n` + chalk.green(`${client.user.tag} is online\n`) + chalk.magenta('Made By- ShreshthTiwari\n') + chalk.blue("Discord- ShreshthTiwari#6014\n") + chalk.yellow("Support Server- https://dsc.gg/b0t-support\n") + chalk.red("GitHub- https://github.com/ShreshthTiwari/MCStats\n") + line);

    async function mcStatsUpdater(guild, database, IP, javaPort, bedrockPort, hiddenPorts, serverStatusChannel){
      embed = new MessageEmbed()
        .setColor(embedConfig.defaultColor);

      async function postStatus (){
        async function showError(){
          let botUpdatesChannelID = await database.get("bot_updates_channel");

          if(botUpdatesChannelID){
            let botUpdatesChannel = await database.get(botUpdatesChannelID);

            if(botUpdatesChannel){
              embed = new MessageEmbed()
                .setDescription(`**UNABLE TO POST SERVER STATUS IN ${serverStatusChannel}.\n
                Please provide me the following permissions in ${serverStatusChannel}-
                1. \`SEND_MESSAGES\`
                2. \`READ_MESSAGE_HISTORY\`
                3. \`MANAGE_MESSAGES\`\n
                ---------------------------\n
                If you have already set the permissions and the bot is still not posting the server status.
                Join the support server and report the issue-
                [JOIN SUPPORT SERVER](${config.supportLink})`)
                .setColor(embedConfig.errorColor);
    
              await botUpdatesChannel.send({embeds: [embed]}).then(async msg => {
                setTimeout(async () => {
                  await msg.delete().catch(error => {});
                }, 2*60*1000);
              });
            }
          }
        }

        try{
          let messages = await serverStatusChannel.messages.fetch({limit: 3});
  
          if(messages){
            let statusMessage = await messages.filter(m => m.author.id === client.user.id).last();
  
            if(statusMessage){
              try{
                statusMessage.edit({embeds: [statusEmbed]}).catch(error => {});
              }catch{
                await showError();

                return;
              }
            }else{
              try{
                serverStatusChannel.send({embeds: [statusEmbed]}).catch(error => {});
              }catch{
                await showError();

                return;
              }
            }
          }else{
            try{
              serverStatusChannel.send({embeds: [statusEmbed]}).catch(error => {});
            }catch{
              await showError();

              return;
            }
          }
        }catch{
          await showError();

          console.log(`${count++}. ` + chalk.red(`Error Updating Server Status Of- ${guild.name} | ${guild.id} `) + chalk.magenta(`(${((new Date()) - time)/1000} seconds)`));

          errors++;

          return;
        }
        
        console.log(`${count}. ` + chalk.green(`Updating Server Status Of- ${guild.name} | ${guild.id} `) + chalk.magenta(`(${((new Date()) - time)/1000} seconds)`));     

        success++;   

        count++;
      }

      if(javaPort){
        if(javaPort < '1'){
          javaPort = null;

          await database.set("java_port", javaPort);

          console.log(`${count++}. ` + chalk.yellow(`Ignoring ${guild.name} | ${guild.id} | Invalid Java Port `) + chalk.magenta(`(${(new Date() - time)/1000} seconds)`));

          return;
        }

        javaPort *= 1;

        try{
          let rawData = await javaFetcher(client, guild.id, IP, javaPort);
              
          if(rawData){
            if(rawData[0] === "ONLINE"){
              let motd = rawData[1];
              let version = rawData[2];
              let online = rawData[3];
              let max = rawData[4];
    
              let sampleList = rawData[5];
              
              let favicon = rawData[6];
              let roundTripLatency = rawData[7];
    
              let playersList;
    
              let queryPort = await database.get("query_port");

              if(queryPort < '1'){
                queryPort = null;
                await database.set("query_port", queryPort);
              }
    
              if(queryPort){
                queryPort *= 1;
                let rawData2 = ["OFFLINE"];

                try{
                  rawData2 = await queryFetcher(IP, queryPort);
    
                  if(rawData2[0] === "ONLINE"){
                    playersList = rawData2[1];
                  }
                }catch{}
              }
  
              if(bedrockPort){
                let rawData3 = ["OFFLINE"];

                try{
                  rawData3 = await bedrockFetcher(IP, bedrockPort);
      
                  if(rawData3[0] === "ONLINE"){
                    javaPort = `JAVA- ${javaPort}\nBEDROCK/PE- ${bedrockPort}`;
                  }
                }catch{}
              }
        
              statusEmbed = new MessageEmbed()
                .addFields({
                  name: `${grass} SERVER EDITION`,
                  value: `\`\`\`fix\nJAVA\n\`\`\``
                },
                {
                  name: `${wifi} SERVER IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                });
              
              if(hiddenPorts == "false"){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
              }
              
              statusEmbed.addFields(
                {
                  name: `${settings} SERVER VERSION`,
                  value: `\`\`\`fix\n${version}\n\`\`\``
                },
                {
                  name: `${users} PLAYING`,
                  value: `\`\`\`fix\n${online}/${max}\n\`\`\``
                },
                {
                  name: `${pen} MOTD`,
                  value: `\`\`\`fix\n${motd}\n\`\`\``
                },
                {
                  name: `${signal} LATENCY`,
                  value: `\`\`\`fix\n${roundTripLatency}ms\n\`\`\``
                })
                .setColor(embedConfig.successColor)
                .setThumbnail(favicon);
    
              if(playersList && playersList.length > 0){
                await statusEmbed.addField(`${users} PLAYERS`, `\`\`\`fix\n${playersList}\n\`\`\``);
              }else if(sampleList && sampleList.length > 0){
                await statusEmbed.addField(`${users} PLAYERS`, `\`\`\`fix\n${sampleList}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
              
              await postStatus();
            }else if(rawData[0] === "OFFLINE"){
              if(bedrockPort){
                javaPort = `JAVA- ${javaPort}\nBEDROCK- ${bedrockPort}`;
              }

              statusEmbed = new MessageEmbed()
                .setTitle("OFFLINE")
                .addFields({
                  name: `${grass} SERVER EDITION`,
                  value: `\`\`\`fix\nJAVA\n\`\`\``
                },
                {
                  name: `${wifi} SERVER IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                })
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogo);
              
              if(hiddenPorts == "false"){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
            
              await postStatus();
            }else{
              statusEmbed = new MessageEmbed()
                .setDescription(`${cross} Error showing server stats.`)
                .addFields({
                  name: `${grass} SERVER EDITION`,
                  value: `\`\`\`fix\nJAVA\n\`\`\``
                },
                {
                  name: `${wifi} SERVER IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                })
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogo);
              
              if(hiddenPorts == "false"){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
              
              await postStatus();
            }
          }else{
            statusEmbed = new MessageEmbed()
              .setDescription(`${cross} Unable to fetch the data. Please check if the **\`IP\`** and **\`PORT\`** are correct.\nAlso check if the server is online.`)
              .addFields({
                name: `${grass} SERVER EDITION`,
                value: `\`\`\`fix\nJAVA\n\`\`\``
              },
              {
                name: `${wifi} SERVER IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``
              })
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogo);
              
            if(hiddenPorts == "false"){
              statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
            }

            statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
              
            serverStatusChannel = `ERROR`;

            statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);

            await postStatus();
          }
        }catch (error){
          statusEmbed = new MessageEmbed()
            .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogo);
              
          serverStatusChannel = `ERROR`;

          statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);

          await postStatus();
        }
      }else if(bedrockPort){
        if(bedrockPort < '1'){
          bedrockPort = null;

          await database.set("bedrock_port", bedrockPort);

          console.log(`${count++}. ` + chalk.yellow(`Ignoring ${guild.name} | ${guild.id} | Invalid Bedrock Port `) + chalk.magenta(`(${(new Date() - time)/1000} seconds)`));

          return;
        }
  
        bedrockPort *= 1;

        try{
          let rawData = await bedrockFetcher(IP, bedrockPort);
              
          if(rawData){
            if(rawData[0] === "ONLINE"){
              let edition = rawData[1];
              let motd = rawData[2];
              let version = rawData[3];
              let online = rawData[4];
              let max = rawData[5];
              let portIPv4 = rawData[6];
              let portIPv6 = rawData[7];

              if(portIPv4 !== "NULL"){
                bedrockPort = `DEFAULT- ${bedrockPort}\nIPv4- ${portIPv4}`;
  
                if(portIPv6 !== "NULL"){
                  bedrockPort = bedrockPort + `\nIPv6- ${portIPv6}`
                }
              }else{
                if(portIPv6 !== "NULL"){
                  bedrockPort = `DEFAULT- ${bedrockPort}\nIPv6- ${portIPv6}`
                }
              }
        
              statusEmbed = new MessageEmbed()
                .addFields({
                  name: `${grass} SERVER EDITION`,
                  value: `\`\`\`fix\n${edition}\n\`\`\``
                },
                {
                  name: `${wifi} SERVER IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                });

              if(hiddenPorts == "false"){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
              }
                
              statusEmbed.addFields(
                {
                  name: `${settings} SERVER VERSION`,
                  value: `\`\`\`fix\n${version}\n\`\`\``
                },
                {
                  name: `${users} PLAYING`,
                  value: `\`\`\`fix\n${online}/${max}\n\`\`\``
                },
                {
                  name: `${pen} MOTD`,
                  value: `\`\`\`fix\n${motd}\n\`\`\``
                })
                .setColor(embedConfig.successColor)
                .setThumbnail(defaultLogo);

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
              
              await postStatus();
            }else if(rawData[0] === "OFFLINE"){
              statusEmbed.setTitle("OFFLINE")
                .addFields({
                  name: `${grass} SERVER EDITION`,
                  value: `\`\`\`fix\nBEDROCK\n\`\`\``
                },
                {
                  name: `${wifi} SERVER IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                })
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogo);

              if(hiddenPorts == "false"){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
              
              await postStatus();
            }else{
              statusEmbed = new MessageEmbed()
                .setDescription(`${cross} Error showing server stats.`)
                .addFields({
                  name: `${grass} SERVER EDITION`,
                  value: `\`\`\`fix\nBEDROCK\n\`\`\``
                },
                {
                  name: `${wifi} SERVER IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                })
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogo);

              if(hiddenPorts == "false"){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
              
              await postStatus();
            }
          }else{
            statusEmbed = new MessageEmbed()
              .setDescription(`${cross} Unable to fetch the data. Please check if the **\`IP\`** and **\`PORT\`** are correct.\nAlso check if the server is online.`)
              .addFields({
                name: `${grass} SERVER EDITION`,
                value: `\`\`\`fix\nBEDROCK\n\`\`\``
              },
              {
                name: `${wifi} SERVER IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``
              })
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogo);

            if(hiddenPorts == "false"){
              statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
            }

            statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
              
            await postStatus();
          }
        }catch (error){
          statusEmbed = new MessageEmbed()
            .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogo);

          statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
              
          await postStatus();
        }
      }else{
        statusEmbed = new MessageEmbed()
          .setDescription(`${cross} **Error Fetching server stats**.`)
          .setColor(embedConfig.errorColor)
          .setThumbnail(defaultLogo);

        statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + totalTime }:R>`);
            
        await postStatus();
      }
    }

    async function updateGuildsList(){
      serversData = {};

      let added = 0;
      let ignored = 0;

      guildsMap = await client.guilds.cache
        .sort((guild1, guild2) => guild1.position - guild2.position)
        .map(guild => guild);
        
      guildsCount = guildsMap.length;
      //interval = Math.round(Math.round(guildsCount/35) + 0.4);

      let index = 0;

      console.log(line);

      for(let i=0; i<=guildsCount-1; i++){
        time = new Date();
        
        let guild = guildsMap[i];

        if(guild){
          database = await databaseBuilder(client, guild);

          if(database){
            let serverStatusChannelID = await database.get("server_status_channel");
            
            if(serverStatusChannelID){
              let serverStatusChannel = await guild.channels.cache.get(serverStatusChannelID);

              if(serverStatusChannel){
                let IP = await database.get("ip");
                let javaPort = await database.get("java_port");
                let bedrockPort = await database.get("bedrock_port");
                let hiddenPorts = await database.get("hidden_ports") || "false";

                if(IP && (javaPort || bedrockPort)){
                  serversData[index] = {
                    guild: guild,
                    database: database,
                    IP: IP,
                    javaPort: javaPort,
                    bedrockPort: bedrockPort,
                    hiddenPorts: hiddenPorts,
                    serverStatusChannel: serverStatusChannel
                  }

                  index++;

                  console.log(`${count++}. ` + chalk.green(`Added ${guild.name} | ${guild.id} | Channel, IP and port found`) + chalk.magenta(`(${((new Date()) - time)/1000} seconds)`));

                  added++;
                }else{
                  console.log(`${count++}. ` + chalk.yellow(`Ignoring ${guild.name} | ${guild.id} | No IP or PORT `) + chalk.magenta(`(${((new Date()) - time)/1000} seconds)`));

                  ignored++;
                }
              }else{
                console.log(`${count++}. ` + chalk.yellow(`Ignoring ${guild.name} | ${guild.id} | Channel not found `) + chalk.magenta(`(${((new Date()) - time)/1000} seconds)`));

                ignored++;
              }
            }else{
              console.log(`${count++}. ` + chalk.yellow(`Ignoring ${guild.name} | ${guild.id} | Channel not set `) + chalk.magenta(`(${(new Date() - time)/1000} seconds)`));

              ignored++;
            }
          }
        }
      }

      console.log(line);

      console.log(line);
      console.log(chalk.magenta(`Total- ${added + ignored}`));
      console.log(chalk.green(`Added- ${added}`));
      console.log(chalk.yellow(`Ignored- ${ignored}`));
      console.log(line);
    }

    async function updater(){
      count = 1;

      await updateGuildsList();

      count = 1;

      embed = new MessageEmbed()
        .setColor(embedConfig.defaultColor);

      success = errors = 0;

      console.log(line);

      for(let i=0; i<=Object.keys(serversData).length-1; i++){
        embed = new MessageEmbed()
          .setColor(embedConfig.defaultColor);
        
        let guild = serversData[i].guild;
        database = serversData[i].database;
        let IP = serversData[i].IP;
        let javaPort = serversData[i].javaPort;
        let bedrockPort = serversData[i].bedrockPort;
        let hiddenPorts = serversData[i].hiddenPorts || "false";
        let serverStatusChannel = serversData[i].serverStatusChannel;

        time = new Date();

        await mcStatsUpdater(guild, database, IP, javaPort, bedrockPort, hiddenPorts, serverStatusChannel);
      }

      console.log(line);

      console.log(line);
      console.log(chalk.magenta(`Total- ${success + errors}`));
      console.log(chalk.green(`Success- ${success}`));
      console.log(chalk.red(`Error- ${errors}`));
      console.log(line);
    }

    let gDB = await databaseBuilder(client, "global");
    await gDB.set("interval", interval);

    let t = new Date();
    count = 1;

    await updater();

    console.log(line);
    totalTime = Math.round((Date.now() - t)/1000);
    console.log(chalk.magenta(`Total Time- `) + chalk.blue(`${totalTime} seconds`) + chalk.magenta('.'));
    console.log(chalk.magenta(`Updating stats every `) + chalk.blue(`${interval} minutes`) + chalk.magenta('.'));
    console.log(line);

    setInterval(async () => {
      t = new Date();

      count = 1;

      await updater();

      console.log(line);
      totalTime = Math.round((Date.now() - t)/1000);
      console.log(chalk.magenta(`Total Time- `) + chalk.blue(`${totalTime} seconds`) + chalk.magenta('.'));
      console.log(chalk.magenta(`Updating stats every `) + chalk.blue(`${interval} minutes`) + chalk.magenta('.'));
      console.log(line);

      time = new Date();
    }, interval * 60 * 1000);
  },
};