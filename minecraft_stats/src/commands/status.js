let { SlashCommandBuilder } = require('@discordjs/builders');

let defaultLogoMC = "https://i.ibb.co/NY6KH17/default-icon.png";
let defaultLogoFivem = "https://i.imgur.com/w4RuVUC.png";
let defaultLogoSAMP = "https://i.imgur.com/eXIEgtR.png";

const javaFetcher = require("../fetcher/javaFetcher.js");
const queryFetcher = require("../fetcher/queryFetcher.js");
const bedrockFetcher = require("../fetcher/bedrockFetcher.js");
const fivemFetcher = require("../fetcher/fivemFetcher.js");
const sampFetcher = require("../fetcher/sampFetcher.js");
const runQuery = require("../sqlite/runQuery.js");
const fetchData = require("../sqlite/fetchData.js");

const emojisFetcher = require("../fetcher/emojisFetcher.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
	  .setDescription('Show minecraft server status.'),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger){
    const emojis = await emojisFetcher(client);
    
    const grass = emojis.grass;
    const wifi = emojis.wifi;
    const settings = emojis.settings;
    const users = emojis.users;
    const pen = emojis.pen;
    const signal = emojis.signal;
    const fiveM = emojis.fiveM;  
    const SAMP = emojis.samp;

    let status = "OFFLINE";

    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    const row = await fetchData(`SELECT * FROM GLOBAL WHERE guild_id LIKE ${interaction.guild.id}`, "each");

    if(row){
      let IP = row.ip;
      let javaPort = (row.java_port * 1) <= 0 ? null : (row.java_port * 1);
      let queryPort = (row.query_port * 1) <= 0 ? null : (row.query_port * 1);
      let bedrockPort = (row.bedrock_port * 1) <= 0 ? null : (row.bedrock_port * 1);
      let fivemPort = (row.fivem_port * 1) <= 0 ? null : (row.fivem_port * 1);
      let sampPort = (row.samp_port * 1) <= 0 ? null : (row.samp_port * 1);
      let hiddenPorts = (row.hidden_ports === "true") ? true : false;
      let downtime = (row.downtime < 0 ? 0 : row.downtime) || 0;
      let total = (row.total < 0 ? 0 : row.total) || 0;
      let displayUptime = (row.display_uptime === "false") ? false : true;
      let onlineSince = ((row.online_since * 1) <= 0 ? null : (row.online_since * 1));
      let fakePlayersOnline = (row.fake_players_online === "true") ? true : false;
      let playersGrowthPercent = (row.players_growth_percent === "true") ? true : false;
      let playersOnline = (isNaN(row.players_online) || (row.players_online * 1) < 0) ? 0 : (row.players_online * 1);
      let playersTotal = (isNaN(row.players_online) || (row.players_online * 1) < 0) ? 0 : (row.players_online * 1);

      total++;

      if(!IP){
        await embed.setDescription(`${cross} Server IP not set.`)
          .setColor(embedConfig.errorColor);
        
        await interaction.editReply({embeds: [embed]}).catch(async error => {
          await errorLogger(client, interaction, error, "src/commands/status.js : 65");
        });
  
        return;
      }
  
      if(!(javaPort || bedrockPort || sampPort || fivemPort)){
        await embed.setDescription(`${cross} Server PORT not set.`)
          .setColor(embedConfig.errorColor);
        
        await interaction.editReply({embeds: [embed]}).catch(async error => {
          await errorLogger(client, interaction, error, "src/commands/status.js : 76");
        });
  
        return;
      }

      if(javaPort){
        try{
          let rawData = await javaFetcher(client, interaction.id, IP, javaPort);
          
          if(rawData){
            if(rawData[0] === "ONLINE"){
              status = "ONLINE";

              if(!onlineSince){
                onlineSince = new Date().getTime();
                
                await runQuery(`UPDATE GLOBAL SET online_since = "${onlineSince}" WHERE guild_id LIKE "${interaction.guild.id}"`);
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

              if(fakePlayersOnline){
                online = online + Math.round((Math.random() * (max - online)) + 1);

                if(online > max){
                  max = online;
                }
              }

              playersOnline += online;
              playersTotal += max;
    
              embed = new MessageEmbed()
                .addFields({
                  name: `${grass} SERVER`,
                  value: `\`\`\`fix\nMinecraft\n\`\`\``
                },
                {
                  name: `${grass} EDITION`,
                  value: `\`\`\`fix\nJAVA\n\`\`\``
                },
                {
                  name: `${wifi} IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                });

                if(!hiddenPorts){
                  embed.addField(`${wifi} PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
                }

                embed.addFields(
                {
                  name: `${settings} VERSION`,
                  value: `\`\`\`fix\n${version}\n\`\`\``
                },
                {
                  name: `${users} PLAYING`,
                  value: `\`\`\`fix\n${online}/${max}\n\`\`\``
                },
                {
                  name: `${signal} LATENCY`,
                  value: `\`\`\`fix\n${roundTripLatency}ms\n\`\`\``
                },
                {
                  name: `${pen} MOTD`,
                  value: `\`\`\`fix\n${motd}\n\`\`\``
                })
                .setColor(embedConfig.successColor)
                .setThumbnail(favicon);

              if(playersList && playersList.length > 0){
                await embed.addField(`${users} PLAYERS`, `\`\`\`fix\n${playersList}\n\`\`\``);
              }else if(sampleList && sampleList.length > 0){
                await embed.addField(`${users} PLAYERS`, `\`\`\`fix\n${sampleList}\n\`\`\``);
              }
            }else if(rawData[0] === "OFFLINE"){
              downtime++;

              if(bedrockPort){
                javaPort = `JAVA- ${javaPort}\nBEDROCK- ${bedrockPort}`;
              }

              embed = new MessageEmbed()
                .setTitle("OFFLINE")
                .addFields({
                  name: `${grass} SERVER`,
                  value: `\`\`\`fix\nMinecraft\n\`\`\``
                },
                {
                  name: `${grass} EDITION`,
                  value: `\`\`\`fix\nJAVA\n\`\`\``
                },
                {
                  name: `${wifi} IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                })
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogoMC);

              if(!hiddenPorts){
                embed.addField(`${wifi} PORT`, `\`\`\`fix\n${javaPort}\n\`\`\``);
              }
            }else{
              embed = new MessageEmbed()
                .setDescription(`${cross} Error showing server stats.`)
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogoMC);
            }
          }else{
            embed = new MessageEmbed()
              .setDescription(`${cross} Unable to fetch the data. Please check if the **\`IP\`** and **\`PORT\`** are correct.\nAlso check if the server is online.`)
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogoMC);
          }
        }catch (error){
          embed = new MessageEmbed()
            .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogoMC);
        }
      }else if(bedrockPort){
        try{
          let rawData = await bedrockFetcher(IP, bedrockPort);
          
          if(rawData){
            if(rawData[0] === "ONLINE"){
              status = "ONLINE";
              
              if(!onlineSince){
                onlineSince = new Date().getTime();
                
                await runQuery(`UPDATE GLOBAL SET online_since = "${onlineSince}" WHERE guild_id LIKE "${interaction.guild.id}"`);
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

              if(fakePlayersOnline){
                online = online + Math.round((Math.random() * (max - online)) + 1);

                if(online > max){
                  max = online;
                }
              }

              playersOnline += online;
              playersTotal += max;
    
              embed = new MessageEmbed()
                .addFields({
                  name: `${grass} SERVER`,
                  value: `\`\`\`fix\nMinecraft\n\`\`\``
                },
                {
                  name: `${grass} EDITION`,
                  value: `\`\`\`fix\n${edition}\n\`\`\``
                },
                {
                  name: `${wifi} IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                });

              if(!hiddenPorts){
                embed.addField(`${wifi} PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
              }
            
              embed.addFields(
                {
                  name: `${settings} VERSION`,
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
              downtime++;

              embed = new MessageEmbed()
                .setTitle("OFFLINE")
                .addFields({
                  name: `${grass} SERVER`,
                  value: `\`\`\`fix\nMinecraft\n\`\`\``
                },
                {
                  name: `${grass} EDITION`,
                  value: `\`\`\`fix\nBEDROCK\n\`\`\``
                },
                {
                  name: `${wifi} IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``
                })
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogoMC);

              if(!hiddenPorts){
                embed.addField(`${wifi} PORT`, `\`\`\`fix\n${bedrockPort}\n\`\`\``);
              }
            }else{
              embed = new MessageEmbed()
                .setDescription(`${cross} Error showing server stats.`)
                .setColor(embedConfig.errorColor)
                .setThumbnail(defaultLogoMC);
            }
          }else{
            embed = new MessageEmbed()
              .setDescription(`${cross} Unable to fetch the data. Please check if the **\`IP\`** and **\`PORT\`** are correct.\nAlso check if the server is online.`)
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogoMC);
          }
        }catch (error){
          embed = new MessageEmbed()
            .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogoMC);
        }
      }else if(fivemPort){
        try{
          let rawData = await fivemFetcher(client, interaction.guild.id, IP, fivemPort);

          if(rawData[0] === "ONLINE"){
            status = "ONLINE";

            if(!onlineSince){
              onlineSince = new Date().getTime();
              
              await runQuery(`UPDATE GLOBAL SET online_since = "${onlineSince}" WHERE guild_id LIKE "${interaction.guild.id}"`);
            }

            let favicon = rawData[1] || defaultLogoFivem;
            let banner = rawData[2];
            let language = rawData[3];
            let max = rawData[4];
            let motd = rawData[5];
            let serverName = rawData[6];
            let tags = rawData[7];
            let online = rawData[8];
            let playersList = rawData[9];

            if(fakePlayersOnline){
              online = online + Math.round((Math.random() * (max - online)) + 1);

              if(online > max){
                max = online;
              }
            }

            playersOnline += online;
            playersTotal += max;

            embed = new MessageEmbed()
            .addFields({
              name: `${fiveM} SERVER`,
              value: `\`\`\`fix\nFiveM\n\`\`\``
            },{
              name: `${fiveM} NAME`,
              value: `\`\`\`fix\n${serverName}\n\`\`\``
            },
            {
              name: `${wifi} IP`,
              value: `\`\`\`fix\n${IP}\n\`\`\``
            });

            if(!hiddenPorts){
              embed.addField(`${wifi} PORT`, `\`\`\`fix\n${fivemPort}\n\`\`\``);
            }

            embed.addFields(
            {
              name: `${users} LANGUAGE`,
              value: `\`\`\`fix\n${language}\n\`\`\``
            },
            {
              name: `${users} PLAYING`,
              value: `\`\`\`fix\n${online}/${max}\n\`\`\``
            },
            {
              name: `${pen} DESCRIPTION`,
              value: `\`\`\`fix\n${motd}\n\`\`\``
            },
            {
              name: `${pen} TAGS`,
              value: `\`\`\`fix\n${tags}\n\`\`\``
            })
            .setColor(embedConfig.successColor)
            .setThumbnail(favicon);

            if(playersList){
              await embed.addField(`${users} PLAYERS`, `\`\`\`fix\n${playersList}\n\`\`\``);
            }

            if(banner){
              embed.setImage(banner);
            }
          }else{
            downtime++;

            embed = new MessageEmbed()
              .setTitle("OFFLINE")
              .addFields({
                name: `${fiveM} SERVER`,
                value: `\`\`\`fix\nFiveM\n\`\`\``
              },{
                name: `${fiveM} NAME`,
                value: `\`\`\`fix\n${serverName}\n\`\`\``
              },
              {
                name: `${wifi} IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``
              })
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogoFivem);

            if(!hiddenPorts){
              embed.addField(`${wifi} PORT`, `\`\`\`fix\n${fivemPort}\n\`\`\``);
            }
          }
        }catch(error){
          embed = new MessageEmbed()
            .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogoFivem);
        }
      }else if(sampPort){
        try{
          let rawData = await sampFetcher(IP, sampPort);

          if(rawData[0] === "ONLINE"){
            status = "ONLINE";

            if(!onlineSince){
              onlineSince = new Date().getTime();
              
              await runQuery(`UPDATE GLOBAL SET online_since = "${onlineSince}" WHERE guild_id LIKE "${interaction.guild.id}"`);
            }

            let serverName = rawData[1];
            let gameMode = rawData[2];
            let map = rawData[3];
            let passworded = rawData[4];
            let max = rawData[5];
            let online = rawData[6];
            let playersList = rawData[7];

            if(fakePlayersOnline){
              online = online + Math.round((Math.random() * (max - online)) + 1);

              if(online > max){
                max = online;
              }
            }

            playersOnline += online;
            playersTotal += max;
  
            embed = new MessageEmbed()
              .addFields({
                name: `${SAMP} SERVER`,
                value: `\`\`\`fix\nSA-MP\n\`\`\``
              },
              {
                name: `${wifi} IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``
              });

              if(!hiddenPorts){
                embed.addField(`${wifi} PORT`, `\`\`\`fix\n${sampPort}\n\`\`\``);
              }

              embed.addFields({
                name: `${SAMP} NAME`,
                value: `\`\`\`fix\n${serverName}\n\`\`\``
              },
              {
                name: `${users} GAMEMODE`,
                value: `\`\`\`fix\n${gameMode}\n\`\`\``
              },
              {
                name: `${users} PLAYING`,
                value: `\`\`\`fix\n${online}/${max}\n\`\`\``
              },
              {
                name: `${pen} MAP`,
                value: `\`\`\`fix\n${map}\n\`\`\``
              },
              {
                name: `${pen} PASSWORD?`,
                value: `\`\`\`fix\n${passworded}\n\`\`\``
              })
              .setColor(embedConfig.successColor)
              .setThumbnail(defaultLogoSAMP);
  
              if(playersList){
                await embed.addField(`${users} PLAYERS`, `\`\`\`fix\n${playersList}\n\`\`\``);
              }
          }else{
            downtime++;

            embed = new MessageEmbed()
              .setTitle("OFFLINE")
              .addFields({
                name: `${SAMP} SERVER`,
                value: `\`\`\`fix\nSA-MP\n\`\`\``
              },
              {
                name: `${wifi} IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``
              })
              .setThumbnail(defaultLogoSAMP)
              .setColor(embedConfig.errorColor);

              if(!hiddenPorts){
                embed.addField(`${wifi} PORT`, `\`\`\`fix\n${sampPort}\n\`\`\``);
              }
          }
        }catch(error){
          embed = new MessageEmbed()
            .setDescription(`${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``)
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogoSAMP);
        }
      }else{
        await embed.setDescription(`${cross} Server IP, port not set.`)
          .setColor(embedConfig.errorColor);
    
        await interaction.editReply({embeds: [embed]}).catch(async error => {
          await errorLogger(client, interaction, error, "src/commands/status.js : 559");
        });

        return;
      }

      if(status === "ONLINE"){
        if(playersGrowthPercent){
          while(((playersTotal % 2 == 0) && (playersOnline % 2 == 0)) || (playersTotal > 1000)){
            playersTotal = Math.round(playersTotal / 2);
            playersOnline = Math.round(playersOnline / 2);
          }

          if(playersTotal <= 0){
            playersTotal = 1;
          }

          embed.addField("PLAYERS GROWTH", `\`\`\`fix\n${((((playersOnline/playersTotal)*100).toFixed(3) + '').replace(".000", ""))}%\n\`\`\``); 

          await runQuery(`UPDATE GLOBAL SET players_total = ${playersTotal}, players_online = ${playersOnline} WHERE guild_id LIKE "${interaction.guild.id}"`);
        }

        if(displayUptime){
          while((total % 2 == 0) && (downtime % 2 == 0 || (total > 1000))){
            total = Math.round(total / 2);
            downtime = Math.round(downtime / 2);
          }

          if(total <= 0){
            total = 1;
          }

          embed.addField("UPTIME", `\`\`\`fix\n${(((100 - (downtime/total)).toFixed(3) + '').replace(".000", ""))}%\n\`\`\``);

          await runQuery(`UPDATE GLOBAL SET total = ${total}, downtime = ${downtime} WHERE guild_id LIKE "${interaction.guild.id}"`);
        }

        embed.addField("ONLINE SINCE", `<t:${Math.round((onlineSince * 1)/1000)}:R>`);
      }else{
        if(onlineSince){
          await runQuery(`UPDATE GLOBAL SET online_since = null WHERE guild_id LIKE "${interaction.guild.id}"`);
        }
      }
    }else{
      await embed.setDescription(`Error occured while fetching the database.\nPlease report it to \`ShreshthTiwari#6014\`.`)
        .setColor(embedConfig.errorColor);
    }

    await interaction.editReply({embeds: [embed]}).catch(async error => {
      await errorLogger(client, interaction, error, "src/commands/status.js : 608");
    });
  },
}