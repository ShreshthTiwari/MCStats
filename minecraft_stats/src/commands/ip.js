let { SlashCommandBuilder } = require('@discordjs/builders');

const emojisFetcher = require("../fetcher/emojisFetcher.js");

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

    let IP = await database.get("ip");
    let javaPort = await database.get("java_port");
    let bedrockPort = await database.get("bedrock_port");
    let hiddenPorts = await database.get("hidden_ports") || "false";

    if(javaPort < '1'){
      javaPort = null;
      await database.set("java_port", javaPort);
    }
    
    if(bedrockPort < '1'){
      bedrockPort = null;
      await database.set("bedrock_port", bedrockPort);
    }

    if(!IP){
      await embed.setDescription(`${cross} Server IP not set.`)
        .setColor(embedConfig.errorColor);
      
      await interaction.editReply({embeds: [embed]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/ip.js : 39");
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
        await errorLogger(client, interaction, error, "src/commands/ip.js : 62");
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

    if(hiddenPorts == "false"){
      embed.addField(`${wifi} SERVER PORT`, `\`\`\`fix\n${port}\n\`\`\``);
    }

    await interaction.editReply({embeds: [embed]}).catch(async error => {
      await errorLogger(client, interaction, error, "src/commands/ip.js : 84");
    });
  },
}