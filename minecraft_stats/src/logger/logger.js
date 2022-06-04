const config = require("../config/config.json");
const {MessageEmbed} = require("discord.js");
const embedConfig = require("../config/embedConfig.json");

module.exports = async (client, logTitle, logText, logColor, errorLogger) => {
  const embed = new MessageEmbed()
    .setColor(embedConfig.defaultColor);
  
  if(logTitle) embed.setTitle(logTitle);

  if(logText) embed.setDescription(logText);

  if(logColor) embed.setColor(logColor);

  const channel = await client.channels.cache.get(config.logsChannel);

  if(channel){
    embed.setTimestamp();
    
    await channel.send({embeds: [embed]}).catch(async error => {
      await errorLogger(client, null, error, "src/logger/logger.js : 21");
    });
  }
}