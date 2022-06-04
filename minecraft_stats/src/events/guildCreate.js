module.exports = {
  name: 'guildCreate',
  async execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger, guild) {
    let guildsCount = await client.guilds.cache.size || 0;

    try{
      await client.user.setActivity(`For /help in ${guildsCount} ${guildsCount > 1 ? "servers" : "server"}`, {type: "WATCHING"});
    }catch(error){
      await errorLogger(client, null, error, "src/commands/ready.js : 9");
    }
    
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);
    
    const logTitle = `[+] Server (${client.guilds.cache.size})`;  
      
    const logText = `**GUILD**
    \`${guild.name}\` **|** \`${guild.id}\``;
      
    const logColor = embedConfig.successColor;

    await logger(client, logTitle, logText, logColor, errorLogger);
  },
};