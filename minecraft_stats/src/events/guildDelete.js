module.exports = {
  name: 'guildDelete',
  async execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger, guild) {
    let guildsCount = await client.guilds.cache.size || 0;

    try{
      await client.user.setActivity(`For /help in ${guildsCount} ${guildsCount > 1 ? "servers" : "server"}`, {type: "WATCHING"});
    }catch(error){
      await errorLogger(client, null, error, "src/commands/ready.js : 9");
    }
    
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);
    
    const logTitle = `[-] Server (${client.guilds.cache.size})`;
       
    const logText = `**NAME**- \`\`\`${guild.name}\`\`\`
    **ID**- \`\`\`${guild.id}\`\`\``;
      
    const logColor = embedConfig.errorColor;

    const database = await databaseBuilder(client, guild);
    
    await database.clear();

    await logger(client, logTitle, logText, logColor, errorLogger);
  },
};