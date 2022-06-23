let { SlashCommandBuilder } = require('@discordjs/builders');

const emojisFetcher = require("../fetcher/emojisFetcher.js");

const buildDB = require("../sqlite/buildDB.js");
const db = buildDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ip')
  	.setDescription('Show ip and port of the minecraft server.'),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger){
    const emojis = await emojisFetcher(client);

    const grass = emojis.grass
    const wifi = emojis.wifi;

    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    db.serialize(async () => {
      db.each(`SELECT ip, java_port, bedrock_port, hidden_ports FROM GLOBAL WHERE guild_id like "${interaction.guild.id}"`, async (error, row) => {
        if(error){
          await errorLogger(client, interaction, error, "src/commands/ip.js : 25");
        }else{
          let IP = row.ip;
          let javaPort = (row.java_port * 1) <= 0 ? null : (row.java_port * 1);
          let bedrockPort = (row.bedrock_port * 1) <= 0 ? null : (row.bedrock_port * 1);
          let hiddenPorts = (row.hidden_ports === "true") ? true : false;
  
          if(!IP){
            await embed.setDescription(`${cross} Server IP not set.`)
              .setColor(embedConfig.errorColor);
            
            await interaction.editReply({embeds: [embed]}).catch(async error => {
              await errorLogger(client, interaction, error, "src/commands/ip.js : 37");
            });
      
            return;
          }
  
          let port;
          let edition;
  
          if(javaPort && bedrockPort){
            edition = "JAVA";
            port = `JAVA- ${javaPort}\nBEDROCK/PE- ${bedrockPort}`;
          }else if(javaPort){
            edition = "JAVA";
            port = javaPort;
          }else if(bedrockPort){
            edition = "BEDROCK";
            port = bedrockPort;
          }else{
            await embed.setDescription(`${cross} Server PORT not set.`)
              .setColor(embedConfig.errorColor);
             
            await interaction.editReply({embeds: [embed]}).catch(async error => {
              await errorLogger(client, interaction, error, "src/commands/ip.js : 60");
            });
        
            return;
          }
  
          embed = new MessageEmbed()
            .addFields({
              name: `${grass} SERVER EDITION`,
              value: `\`\`\`fix\n${edition}\n\`\`\``
            },
            {
              name: `${wifi} SERVER IP`,
              value: `\`\`\`fix\n${IP}\n\`\`\``
            })
            .setColor(embedConfig.defaultColor);
  
          if(!hiddenPorts){
            embed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${port}\n\`\`\``);
          }
  
          await interaction.editReply({embeds: [embed]}).catch(async error => {
            await errorLogger(client, interaction, error, "src/commands/ip.js : 82");
          });
        }
      });
    });
  },
}