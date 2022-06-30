const chalk = require("chalk");

let defaultLogo = "https://i.ibb.co/NY6KH17/default-icon.png";

const javaFetcher = require("../fetcher/javaFetcher.js");
const queryFetcher = require("../fetcher/queryFetcher.js");
const bedrockFetcher = require("../fetcher/bedrockFetcher.js");
const emojisFetcher = require("../fetcher/emojisFetcher.js");

const runQuery = require("../sqlite/runQuery.js");

let interval;

const line = "--------------------------------------------------------------";

let count = 0;
let startTime = new Date();

let serverStatusMessageID = [];
let channel = [];
let statusEmbed = [];
let status = [];

module.exports = {
  name: 'ready',
  once: true,
  async execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger) {
    interval = config.interval;

    const database = await databaseBuilder();

    await runQuery(`CREATE TABLE IF NOT EXISTS GLOBAL (guild_id TEXT PRIMARY KEY, ip TEXT, java_port TEXT, query_port TEXT, bedrock_port TEXT, bot_updates_channel TEXT, server_status_channel TEXT, hidden_ports TEXT, downtime INT, total INT, display_uptime TEXT, status_message_id TEXT, online_since TEXT, fake_players_online TEXT, players_growth_percent TEXT)`);
    await runQuery(`DELETE FROM GLOBAL WHERE NOT guild_id`);

    const guildsCount = await client.guilds.cache.size || 0;

    try{
      await client.user.setActivity(`For /help in ${guildsCount} ${guildsCount > 1 ? "servers" : "server"}`, {type: "WATCHING"});
    }catch(error){
      await errorLogger(client, null, error, "src/commands/ready.js : 40");
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

    async function updater(){
      console.log(line + '\n' + chalk.magenta("Updating Server Stats now- ") + chalk.blue(new Date().toLocaleTimeString('en-US',{timeZone:'Asia/Kolkata'})) + chalk.magenta('.'));

      await database.serialize(async () => {
        await database.all(`SELECT * FROM GLOBAL WHERE (server_status_channel IS NOT NULL AND ip IS NOT NULL AND (java_port IS NOT NULL OR bedrock_port IS NOT NULL))`, async (error, rows) => {
          if(error){
            await errorLogger(client, null, error, "src/events/ready.js : 65");
          }else{
            rows.forEach(async row => {
              const guild = await client.guilds.cache.get(row.guild_id);
    
              if(guild){
                statusEmbed[guild.id] = new MessageEmbed()
                  .setColor(embedConfig.defaultColor);
  
                const serverStatusChannel = await guild.channels.cache.get(row.server_status_channel);
    
                if(serverStatusChannel){
                  statusEmbed[guild.id] = new MessageEmbed()
                    .setColor(embedConfig.defaultColor);
  
                  let IP = row.ip;
                  let javaPort = (row.java_port * 1) <= 0 ? null : (row.java_port * 1);
                  let queryPort = (row.query_port * 1) <= 0 ? null : (row.query_port * 1);
                  let bedrockPort = (row.bedrock_port * 1) <= 0 ? null : (row.bedrock_port * 1);
                  let hiddenPorts = (row.hidden_ports === "true") ? true : false;
                  let downtime = (row.downtime < 0 ? 0 : row.downtime) || 0;
                  let total = (row.total < 0 ? 0 : row.total) || 0;
                  let displayUptime = (row.display_uptime === "false") ? false : true;
                  let onlineSince = ((row.online_since * 1) <= 0 ? null : (row.online_since * 1));
                  let fakePlayersOnline = (row.fake_players_online === "true") ? true : false;
                  let playersGrowthPercent = (row.players_growth_percent === "true") ? true : false;
                  let players = (isNaN(row.players) || (row.players * 1) < 0) ? 0 : (row.players * 1);
                  let playersOnline = 0;
                  status[guild.id] = "OFFLINE";
                    
                  total++;
  
                  statusEmbed[guild.id] = new MessageEmbed()
                    .setColor(embedConfig.defaultColor);
  
                  if(javaPort){
                    statusEmbed[guild.id] = new MessageEmbed()
                      .setColor(embedConfig.defaultColor);
  
                    try{
                      let rawData = await javaFetcher(client, guild.id, IP, javaPort) || ["OFFLINE"];
                          
                      if(rawData){
                        if(rawData[0] === "ONLINE"){
                          if(!onlineSince){
                            onlineSince = new Date().getTime();
                            
                            await runQuery(`UPDATE GLOBAL SET online_since = "${onlineSince}" WHERE guild_id LIKE "${guild.id}"`);
                          }
  
                          status[guild.id] = "ONLINE";
  
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

                          if(fakePlayersOnline){
                            online = online + Math.round((Math.random() * (max - online)) + 1);
        
                            if(online > max){
                              max = online;
                            }
                          }

                          playersOnline = online;
                    
                          statusEmbed[guild.id] = new MessageEmbed()
                            .addFields({
                              name: `${grass} SERVER EDITION`,
                              value: `\`\`\`fix\nJAVA\n\`\`\``
                            },
                            {
                              name: `${wifi} SERVER IP`,
                              value: `\`\`\`fix\n${IP}\n\`\`\``
                            });
                          
                          if(!hiddenPorts){
                            statusEmbed[guild.id].addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
                          }
                          
                          statusEmbed[guild.id].addFields(
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
                            await statusEmbed[guild.id].addField(`${users} PLAYERS`, `\`\`\`fix\n${playersList}\n\`\`\``);
                          }else if(sampleList && sampleList.length > 0){
                            await statusEmbed[guild.id].addField(`${users} PLAYERS`, `\`\`\`fix\n${sampleList}\n\`\`\``);
                          }
                        }else if(rawData[0] === "OFFLINE"){
                          downtime++;
  
                          if(bedrockPort){
                            javaPort = `JAVA- ${javaPort}\nBEDROCK- ${bedrockPort}`;
                          }
  
                          statusEmbed[guild.id] = new MessageEmbed()
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
                          
                          if(!hiddenPorts){
                            statusEmbed[guild.id].addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
                          }
                        }
                      }
                    }catch (error){
                      statusEmbed[guild.id] = new MessageEmbed()
                        .setColor(embedConfig.defaultColor);
  
                      statusEmbed[guild.id] = new MessageEmbed()
                        .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
                        .setColor(embedConfig.errorColor)
                        .setThumbnail(defaultLogo);
                          
                      serverStatusChannel = `ERROR`;
                    }
                  }else if(bedrockPort){
                    statusEmbed[guild.id] = new MessageEmbed()
                      .setColor(embedConfig.defaultColor);
  
                    try{
                      let rawData = await bedrockFetcher(IP, bedrockPort) || ["OFFLINE"];
                          
                      if(rawData){
                        if(rawData[0] === "ONLINE"){
                          if(!onlineSince){
                            onlineSince = new Date().getTime();
                            
                            await runQuery(`UPDATE GLOBAL SET online_since = "${onlineSince}" WHERE guild_id LIKE "${guild.id}"`);
                          }
  
                          status[guild.id] = "ONLINE";
  
                          let edition = rawData[1];
                          let motd = rawData[2];
                          let version = rawData[3];
                          let online = rawData[4];
                          let max = rawData[5];
                          let portIPv4 = rawData[6];
                          let portIPv6 = rawData[7];
  
                          if(portIPv4 !== "NULL" || portIPv6 !== "NULL"){
                            bedrockPort = `DEFAULT- ${bedrockPort}`;
  
                            if(portIPv4 !== "NULL"){
                              bedrockPort = bedrockPort + `\nIPv4- ${portIPv4}`;
                            }
  
                            if(portIPv6 !== "NULL"){
                              bedrockPort = bedrockPort + `\nIPv6- ${portIPv6}`;
                            }
                          }

                          if(fakePlayersOnline){
                            online = online + Math.round((Math.random() * (max - online)) + 1);
        
                            if(online > max){
                              max = online;
                            }
                          }

                          playersOnline = online;

                          statusEmbed[guild.id] = new MessageEmbed()
                            .addFields({
                              name: `${grass} SERVER EDITION`,
                              value: `\`\`\`fix\n${edition}\n\`\`\``
                            },
                            {
                              name: `${wifi} SERVER IP`,
                              value: `\`\`\`fix\n${IP}\n\`\`\``
                            });
  
                          if(!hiddenPorts){
                            statusEmbed[guild.id].addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
                          }
                            
                          statusEmbed[guild.id].addFields(
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
                        }else if(rawData[0] === "OFFLINE"){
                          downtime++;
  
                          statusEmbed[guild.id].setTitle("OFFLINE")
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
  
                          if(!hiddenPorts){
                            statusEmbed[guild.id].addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
                          }
                        }
                      }
                    }catch (error){
                      statusEmbed[guild.id] = new MessageEmbed()
                        .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
                        .setColor(embedConfig.errorColor)
                        .setThumbnail(defaultLogo);
                    }
                  }else{
                    statusEmbed[guild.id] = new MessageEmbed()
                      .setColor(embedConfig.defaultColor);
  
                    statusEmbed[guild.id] = new MessageEmbed()
                      .setDescription(`${cross} **Error Fetching server stats**.`)
                      .setColor(embedConfig.errorColor)
                      .setThumbnail(defaultLogo);
                  }
  
                  if(downtime < 0){
                    downtime = 0;
                  }
  
                  if(total < 0){
                    total = 1;
                  }
  
                  if(displayUptime || playersGrowthPercent){
                    while( (total % 2 == 0) && (downtime % 2 == 0)){
                      if(players){
                        players = Math.round(players / 2);
                        playersOnline = Math.round(playersOnline/2);
                      }

                      total /= 2;
                      downtime /= 2;
                    }

                    if(total <= 0){
                      total = 1;
                    }

                    let growthPercentage = ((playersOnline - players) / players) * 100;

                    players = playersOnline;
  
                    await runQuery(`UPDATE GLOBAL SET total = ${total}, downtime = ${downtime}, players = ${players} WHERE guild_id LIKE "${guild.id}"`);

                    if(playersGrowthPercent){
                      statusEmbed[guild.id].addField("PLAYERS GROWTH", `\`\`\`fix\n${((growthPercentage.toFixed(3) + '').replace(".000", ""))}%\n\`\`\``);
                    }

                    if(displayUptime){
                      statusEmbed[guild.id].addField("UPTIME", `\`\`\`fix\n${(((100 - (downtime/total)).toFixed(3) + '').replace(".000", ""))}%\n\`\`\``);
                    }
                  }
  
                  if(status[guild.id] === "ONLINE"){
                    statusEmbed[guild.id].addField("ONLINE SINCE", `<t:${Math.round((onlineSince * 1)/1000)}:R>`);
                  }else{
                    if(onlineSince){
                      await runQuery(`UPDATE GLOBAL SET online_since = null WHERE guild_id LIKE "${guild.id}"`);
                    }
                  }
  
                  statusEmbed[guild.id].addField("UPDATING", `<t:${Math.round(new Date().getTime()/1000) + (interval * 60) + 30}:R>`)
                    .setTimestamp();
  
                  channel[guild.id] = serverStatusChannel;
                  serverStatusMessageID[guild.id] = row.status_message_id;
  
                  if(serverStatusMessageID[guild.id]){
                    await channel[guild.id].messages.fetch(serverStatusMessageID[guild.id]).then(async (msg) => {
                      await msg.edit({embeds: [statusEmbed[guild.id]]}).then(async () => {
                        console.log(`${++count}. ` + chalk.green(`Updating Server Status Of- ${guild.name} | ${guild.id}. `) + chalk.magenta(`(${(new Date() - startTime) / 1000} seconds)`));
                      });
  
                      channel[guild.id] = serverStatusMessageID[guild.id] = null;
                      statusEmbed[guild.id] = new MessageEmbed();
                    }).catch(async () => {
                      await channel[guild.id].send({embeds: [statusEmbed[guild.id]]}).then(async (msg) => {
                        await runQuery(`UPDATE GLOBAL SET status_message_id = "${msg.id}" WHERE guild_id LIKE "${guild.id}"`);
  
                        console.log(`${++count}. ` + chalk.green(`Updating Server Status Of- ${guild.name} | ${guild.id}. `) + chalk.magenta(`(${(new Date() - startTime) / 1000} seconds)`));
                      }).catch(async () => {
                        console.log(`${++count}. ` + chalk.red(`Error Updating Server Status Of- ${guild.name} | ${guild.id}. `) + chalk.magenta(`(${(new Date() - startTime) / 1000} seconds)`));
                      });
  
                      channel[guild.id] = serverStatusMessageID[guild.id] = null;
                      statusEmbed[guild.id] = new MessageEmbed();
                    });
                  }else{
                    await channel[guild.id].send({embeds: [statusEmbed[guild.id]]}).then(async (msg) => {
                      await runQuery(`UPDATE GLOBAL SET status_message_id = "${msg.id}" WHERE guild_id LIKE "${guild.id}"`);
  
                      console.log(`${++count}. ` + chalk.green(`Updating Server Status Of- ${guild.name} | ${guild.id}. `) + chalk.magenta(`(${(new Date() - startTime) / 1000} seconds)`));
                    }).catch(async () => {
                      console.log(`${++count}. ` + chalk.red(`Error Updating Server Status Of- ${guild.name} | ${guild.id}. `) + chalk.magenta(`(${(new Date() - startTime) / 1000} seconds)`));
                    });
  
                    channel[guild.id] = serverStatusMessageID[guild.id] = null;
                    statusEmbed[guild.id] = new MessageEmbed();
                  }
                }else{
                  await runQuery(`UPDATE GLOBAL SET server_status_channel = null WHERE guild_id LIKE "${guild.id}"`);
                }
              }else{
                await runQuery(`DELETE FROM GLOBAL WHERE guild_id LIKE "${row.guild_id}"`);
              }
            });

            console.log(line);
          }
        });

        console.log(chalk.magenta(`Updating stats every `) + chalk.blue(`${interval} minutes`) + chalk.magenta('.') + '\n' + line);
      });
    }

    /*await client.guilds.cache.forEach(async guild => {
      //await runQuery(`DROP TABLE IF EXISTS "${guild.id}"`);
      //await runQuery(`CREATE TABLE IF NOT EXISTS "${guild.id}" (timestamp INT, status TEXT, players INT)`);
      //await runQuery(`INSERT OR IGNORE INTO GLOBAL (guild_id, hidden_ports) VALUES ("${guild.id}", "false")`);
      //await runQuery(`UPDATE GLOBAL SET display_uptime = "true" WHERE guild_id LIKE "${guild.id}"`);
      //await runQuery(`UPDATE GLOBAL SET fake_players_online = "false" WHERE guild_id LIKE "${guild.id}"`);
      //await runQuery(`UPDATE GLOBAL SET players_growth_percent = "false" WHERE guild_id LIKE "${guild.id}"`);
      //await runQuery(`UPDATE GLOBAL SET players = 0 WHERE guild_id LIKE "${guild.id}"`);
    });*/

    await updater();
 
    setInterval(async () => {
      count = 0;
      startTime = new Date();

      await updater();
    }, interval * 60 * 1000);
  },
};