let { SlashCommandBuilder } = require('@discordjs/builders');

let defaultLogo = "https://i.ibb.co/NY6KH17/default-icon.png";

const javaFetcher = require("../fetcher/javaFetcher.js");
const queryFetcher = require("../fetcher/queryFetcher.js");
const bedrockFetcher = require("../fetcher/bedrockFetcher.js");
const runQuery = require("../sqlite/runQuery.js");

const emojisFetcher = require("../fetcher/emojisFetcher.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
	  .setDescription('Show minecraft server status.'),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger){
    const emojis = await emojisFetcher(client);
    
    const grass = emojis.grass;
    const wifi = emojis.wifi;
    const settings = emojis.settings;
    const users = emojis.users;
    const pen = emojis.pen;
    const signal = emojis.signal;

    let status = "OFFLINE";

    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    database.serialize(async () => {
      database.each(`SELECT ip, java_port, query_port, bedrock_port, hidden_ports, downtime, total, display_uptime FROM GLOBAL WHERE guild_id like "${interaction.guild.id}"`, async (error, row) => {
        if(error){
          await errorLogger(client, interaction, error, "src/commands/status.js : 35");
        }else{
          let IP = row.ip;
          let javaPort = (row.java_port * 1) <= 0 ? null : (row.java_port * 1);
          let queryPort = (row.query_port * 1) <= 0 ? null : (row.query_port * 1);
          let bedrockPort = (row.bedrock_port * 1) <= 0 ? null : (row.bedrock_port * 1);
          let hiddenPorts = (row.hidden_ports === "true") ? true : false;
          let display_uptime = (row.display_uptime === "false") ? false : true;
          let onlineSince = ((row.online_since * 1) <= 0 ? null : (row.online_since * 1));
  
          if(!IP){
            await embed.setDescription(`${cross} Server IP not set.`)
              .setColor(embedConfig.errorColor);
            
            await interaction.editReply({embeds: [embed]}).catch(async error => {
              await errorLogger(client, interaction, error, "src/commands/status.js : 50");
            });
      
            return;
          }
      
          if(!(javaPort || bedrockPort)){
            await embed.setDescription(`${cross} Server PORT not set.`)
              .setColor(embedConfig.errorColor);
            
            await interaction.editReply({embeds: [embed]}).catch(async error => {
              await errorLogger(client, interaction, error, "src/commands/status.js : 61");
            });
      
            return;
          }
  
          if(javaPort){
            try{
              let rawData = await javaFetcher(client, interaction.id, IP, javaPort);
              
              if(rawData){
                if(rawData[0] === "ONLINE"){
                  if(!onlineSince){
                    onlineSince = new Date().getTime();
                    
                    await runQuery(`UPDATE GLOBAL SET online_since = "${onlineSince}" WHERE guild_id LIKE "${guild.id}"`);
                  }
  
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
        
                  embed = new MessageEmbed()
                    .addFields({
                      name: `${grass} SERVER EDITION`,
                      value: `\`\`\`fix\nJAVA\n\`\`\``
                    },
                    {
                      name: `${wifi} SERVER IP`,
                      value: `\`\`\`fix\n${IP}\n\`\`\``
                    });
  
                    if(!hiddenPorts){
                      embed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
                    }
  
                    embed.addFields(
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
                    await embed.addField(`${users} PLAYERS`, `\`\`\`fix\n${playersList}\n\`\`\``);
                  }else if(sampleList && sampleList.length > 0){
                    await embed.addField(`${users} PLAYERS`, `\`\`\`fix\n${sampleList}\n\`\`\``);
                  }
                }else if(rawData[0] === "OFFLINE"){
                  if(bedrockPort){
                    javaPort = `JAVA- ${javaPort}\nBEDROCK- ${bedrockPort}`;
                  }
  
                  await embed.setTitle("OFFLINE")
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
                    embed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
                  }
                }else{
                  embed = new MessageEmbed()
                    .setDescription(`${cross} Error showing server stats.`)
                    .setColor(embedConfig.errorColor)
                    .setThumbnail(defaultLogo);
                }
              }else{
                embed = new MessageEmbed()
                  .setDescription(`${cross} Unable to fetch the data. Please check if the **\`IP\`** and **\`PORT\`** are correct.\nAlso check if the server is online.`)
                  .setColor(embedConfig.errorColor)
                  .setThumbnail(defaultLogo);
              }
            }catch (error){
              embed = new MessageEmbed()
                .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogo);
            }
          }else if(bedrockPort){
            try{
              let rawData = await bedrockFetcher(IP, bedrockPort);
              
              if(rawData){
                if(rawData[0] === "ONLINE"){  
                  if(!onlineSince){
                    onlineSince = new Date().getTime();
                    
                    await runQuery(`UPDATE GLOBAL SET online_since = "${onlineSince}" WHERE guild_id LIKE "${guild.id}"`);
                  }
  
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
        
                  embed = new MessageEmbed()
                    .addFields({
                      name: `${grass} SERVER EDITION`,
                      value: `\`\`\`fix\n${edition}\n\`\`\``
                    },
                    {
                      name: `${wifi} SERVER IP`,
                      value: `\`\`\`fix\n${IP}\n\`\`\``
                    });
  
                  if(!hiddenPorts){
                    embed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
                  }
                
                  embed.addFields(
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
                    .setColor(embedConfig.successColor);
                }else if(rawData[0] === "OFFLINE"){
                  await embed.setTitle("OFFLINE")
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
                    embed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
                  }
                }else{
                  embed = new MessageEmbed()
                    .setDescription(`${cross} Error showing server stats.`)
                    .setColor(embedConfig.errorColor)
                    .setThumbnail(defaultLogo);
                }
              }else{
                embed = new MessageEmbed()
                  .setDescription(`${cross} Unable to fetch the data. Please check if the **\`IP\`** and **\`PORT\`** are correct.\nAlso check if the server is online.`)
                  .setColor(embedConfig.errorColor)
                  .setThumbnail(defaultLogo);
              }
            }catch (error){
              embed = new MessageEmbed()
                .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogo);
            }
          }else{
            await embed.setDescription(`${cross} Server IP, port not set.`)
              .setColor(embedConfig.errorColor);
        
            await interaction.editReply({embeds: [embed]}).catch(async error => {
              await errorLogger(client, interaction, error, "src/commands/status.js : 291");
            });
  
            return;
          }
  
          if(display_uptime){
            let downtime = (row.downtime < 0 ? 0 : row.downtime) || 0;
            let total = (row.total < 0 ? 0 : row.total) || 1;
  
            embed.addField("UPTIME", `\`\`\`fix\n${100 - (downtime/total)}%\n\`\`\``);
          }
  
          if(status === "ONLINE"){
            embed[guild.id].addField("ONLINE SINCE", `<t:${Math.round((onlineSince * 1)/1000)}:R>`);
          }else{
            if(onlineSince){
              await runQuery(`UPDATE GLOBAL SET online_since = null WHERE guild_id LIKE "${guild.id}"`);
            }
          }
  
          await interaction.editReply({embeds: [embed]}).catch(async error => {
            await errorLogger(client, interaction, error, "src/commands/status.js : 313");
          });
        }
      });
    });
  },
}