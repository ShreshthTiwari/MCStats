const chalk = require("chalk");

let defaultLogo = "https://i.ibb.co/NY6KH17/default-icon.png";

const javaFetcher = require("../fetcher/javaFetcher.js");
const queryFetcher = require("../fetcher/queryFetcher.js");
const bedrockFetcher = require("../fetcher/bedrockFetcher.js");

const emojisFetcher = require("../fetcher/emojisFetcher.js");

const runQuery = require("../sqlite/runQuery.js");

let interval = 10;

const line = "--------------------------------------------------------------";

module.exports = {
  name: 'ready',
  once: true,
  async execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger) {
    const database = await databaseBuilder();

    await runQuery(`CREATE TABLE IF NOT EXISTS GLOBAL (guild_id TEXT PRIMARY KEY, ip TEXT, java_port TEXT, query_port TEXT, bedrock_port TEXT, bot_updates_channel TEXT, server_status_channel TEXT, hidden_ports TEXT)`);

    let statusEmbed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    guildsCount = await client.guilds.cache.size;

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

    async function updateStatus(guild, serverStatusChannel, IP, javaPort, queryPort, bedrockPort, hiddenPorts){
      async function postStatus(){
        try{
          let messages = await serverStatusChannel.messages.fetch({limit: 3});
  
          if(messages){
            let statusMessage = await messages.filter(m => m.author.id === client.user.id).last();
  
            if(statusMessage){
              try{
                statusMessage.edit({embeds: [statusEmbed]}).catch(error => {});
              }catch{
                return;
              }
            }else{
              try{
                serverStatusChannel.send({embeds: [statusEmbed]}).catch(error => {});
              }catch{
                return;
              }
            }
          }else{
            try{
              serverStatusChannel.send({embeds: [statusEmbed]}).catch(error => {});
            }catch{
              return
            }
          }
        }catch{
          return;
        }

        //console.log(`${++count}. ` + chalk.green(`Updating Server Status Of- ${guild.name} | ${guild.id}. `) + chalk.magenta(`(${(new Date() - startTime2) / 1000} seconds)`));
      }

      statusEmbed = new MessageEmbed()
        .setColor(embedConfig.defaultColor);

      if(javaPort){
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

              if(queryPort){
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
              
              if(!hiddenPorts){
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
                .setThumbnail(favicon)
                .setTimestamp();
    
              if(playersList && playersList.length > 0){
                await statusEmbed.addField(`${users} PLAYERS`, `\`\`\`fix\n${playersList}\n\`\`\``);
              }else if(sampleList && sampleList.length > 0){
                await statusEmbed.addField(`${users} PLAYERS`, `\`\`\`fix\n${sampleList}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);
              
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
                .setThumbnail(defaultLogo)
                .setTimestamp();
              
              if(!hiddenPorts){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);
            
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
                .setThumbnail(defaultLogo)
                .setTimestamp();
              
              if(!hiddenPorts){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);
              
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
              .setThumbnail(defaultLogo)
              .setTimestamp();
              
            if(!hiddenPorts){
              statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
            }
              
            serverStatusChannel = `ERROR`;

            statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);

            await postStatus();
          }
        }catch (error){
          statusEmbed = new MessageEmbed()
            .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogo)
            .setTimestamp();
              
          serverStatusChannel = `ERROR`;

          statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);

          await postStatus();
        }
      }else if(bedrockPort){
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

              if(!hiddenPorts){
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
                .setThumbnail(defaultLogo)
                .setTimestamp();

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);
              
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
                .setThumbnail(defaultLogo)
                .setTimestamp();

              if(!hiddenPorts){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);
              
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
                .setThumbnail(defaultLogo)
                .setTimestamp();

              if(!hiddenPorts){
                statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
              }

              statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);
              
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
              .setThumbnail(defaultLogo)
              .setTimestamp();

            if(!hiddenPorts){
              statusEmbed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
            }

            statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);
              
            await postStatus();
          }
        }catch (error){
          statusEmbed = new MessageEmbed()
            .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogo)
            .setTimestamp();

          statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);
              
          await postStatus();
        }
      }else{
        statusEmbed = new MessageEmbed()
          .setDescription(`${cross} **Error Fetching server stats**.`)
          .setColor(embedConfig.errorColor)
          .setThumbnail(defaultLogo)
          .setTimestamp();

        statusEmbed.addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) }:R>`);
            
        await postStatus();
      }
    }

    async function updater(){
      console.log(line + '\n' + chalk.magenta("Updating Server Stats now- ") + chalk.yellow(new Date().toLocaleTimeString()));

      database.serialize(async () => {
        database.each(`SELECT guild_id, server_status_channel, ip, java_port, bedrock_port, hidden_ports FROM GLOBAL WHERE (server_status_channel IS NOT NULL AND ip IS NOT NULL AND (java_port IS NOT NULL OR bedrock_port IS NOT NULL))`, async (error, row) => {
          let guild = await client.guilds.cache.get(row.guild_id);

          if(guild){
            let serverStatusChannel = await guild.channels.cache.get(row.server_status_channel);

            if(serverStatusChannel){
              let IP = row.ip;
              let javaPort = (row.java_port * 1) <= 0 ? null : (row.java_port * 1);
              let queryPort = (row.query_port * 1) <= 0 ? null : (row.query_port * 1);
              let bedrockPort = (row.bedrock_port * 1) <= 0 ? null : (row.bedrock_port * 1);
              let hiddenPorts = (row.hidden_ports === "true") ? true : false;
                
              await updateStatus(guild, serverStatusChannel, IP, javaPort, queryPort, bedrockPort, hiddenPorts);
            }
          }else{
            await runQuery(`DELETE FROM GLOBAL WHERE guild_id LIKE "${row.guild_id}"`);
          }
        });

        console.log(chalk.magenta(`Updating stats every `) + chalk.blue(`${interval} minutes`) + chalk.magenta('.') + '\n' + line);
      });
    }

    await client.guilds.cache.forEach(async (Guild) => {
      await runQuery(`INSERT OR IGNORE INTO GLOBAL (guild_id, hidden_ports) 
      VALUES ("${Guild.id}", "false")`);
    });

    await updater();

    setInterval(async () => {
      await updater();
    }, interval * 60 * 1000);
  },
};