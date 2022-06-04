
let { SlashCommandBuilder } = require('@discordjs/builders');

let defaultLogo = "https://i.ibb.co/NY6KH17/default-icon.png";

const javaFetcher = require("../fetcher/javaFetcher.js");
const queryFetcher = require("../fetcher/queryFetcher.js");
const bedrockFetcher = require("../fetcher/bedrockFetcher.js");

const emojis = require("../config/emojis.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
	  .setDescription('Ping a server and show its status.')
    .addSubcommand(subcommand =>
      subcommand.setName('java').setDescription("Ping a java server.")
        .addStringOption(option => option.setName("ip").setDescription("Java server IP.").setRequired(true))
        .addIntegerOption(option => option.setName("java_port").setDescription("Java server port."))
        .addIntegerOption(option => option.setName("query_port").setDescription("Java server query port."))
        .addIntegerOption(option => option.setName("bedrock_port").setDescription("Bedrock server port."))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('bedrock').setDescription("Ping a bedrock server.")
        .addStringOption(option => option.setName("ip").setDescription("Bedrock server IP.").setRequired(true))
        .addIntegerOption(option => option.setName("bedrock_port").setDescription("Bedrock server port."))
    ),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger){
    const grass = emojis.grass;
    const wifi = emojis.wifi;
    const settings = emojis.settings;
    const users = emojis.users;
    const pen = emojis.pen;
    const signal = emojis.signal;    

    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    let IP = await interaction.options.getString("ip");

    if(interaction.options.getSubcommand() === "java"){
      let javaPort = await interaction.options.getInteger("java_port") || 25565;
      let bedrockPort = await interaction.options.getInteger("bedrock_port") || null;

      if(javaPort < 1){
        javaPort = null;
        await database.set("java_port", javaPort);

        embed.setDescription(`${cross} Java Port Cannot be less than 0.`)
          .setDescription(embedConfig.errorColor);

        return;
      }
      
      if(bedrockPort < 1){
        bedrockPort = null;
        await database.set("bedrock_port", bedrockPort);
      }

      try{
        let rawData = await javaFetcher(client, interaction.id, IP, javaPort);
            
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
  
            let queryPort = await interaction.options.getInteger("query_port");

            if(queryPort < 1){
              queryPort = null;
              await database.set("query_port", queryPort);
            }
  
            if(queryPort){
              let rawData2 = ["OFFLINE"];

              try{
                rawData2 = await queryFetcher(client, IP, queryPort);
  
                if(rawData2[0] === "ONLINE"){
                  playersList = rawData2[1];
                }
              }catch{}
            }

            if(bedrockPort){
              let rawData3 = ["OFFLINE"];
              
              try{
                rawData3 = await bedrockFetcher(client, IP, bedrockPort);
    
                if(rawData3[0] === "ONLINE"){
                  javaPort = `JAVA- ${javaPort}\nBEDROCK- ${bedrockPort}`;
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
              },
              {
                name: `${wifi} SERVER PORT`,
                value: `\`\`\`fix\n${javaPort}\n\`\`\``
              },
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
              javaPort = `JAVA- ${javaPort}\nBEDROCK/PE- ${bedrockPort}`;
            }

            await embed.setTitle("OFFLINE")
              .addFields({
                name: `${grass} SERVER EDITION`,
                value: `\`\`\`fix\nJAVA\n\`\`\``
              },
              {
                name: `${wifi} SERVER IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``
              },
              {
                name: `${wifi} SERVER PORT`,
                value: `\`\`\`fix\n${javaPort}\n\`\`\``
              })
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogo);
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
    }else if(interaction.options.getSubcommand() === "bedrock"){
      let bedrockPort = await interaction.options.getInteger("bedrock_port") || 19132;

      if(bedrockPort < 1){
        bedrockPort = null;
        await database.set("bedrock_port", bedrockPort);

        embed.setDescription(`${cross} Bedrock Port Cannot be less than 0.`)
          .setDescription(embedConfig.errorColor);

        return;
      }
      
      try{
        let rawData = await bedrockFetcher(client, IP, bedrockPort);
            
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
      
            embed = new MessageEmbed()
              .addFields({
                name: `${grass} SERVER EDITION`,
                value: `\`\`\`fix\n${edition}\n\`\`\``
              },
              {
                name: `${wifi} SERVER IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``
              },
              {
                name: `${wifi} SERVER PORT`,
                value: `\`\`\`fix\n${bedrockPort}\n\`\`\``
              },
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
              },
              {
                name: `${wifi} SERVER PORT(IPv4)`,
                value: `\`\`\`fix\n${portIPv4}\n\`\`\``
              })
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogo);
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
        await errorLogger(client, interaction, error, "src/commands/status.js : 287");
      });

      return;
    }
      
    await interaction.editReply({embeds: [embed]}).catch(async error => {
      await errorLogger(client, interaction, error, "src/commands/status.js : 294");
    });
  },
}