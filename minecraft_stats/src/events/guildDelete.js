const runQuery = require("../sqlite/runQuery.js");

module.exports = {
  name: 'guildDelete',
  async execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger, guild) {
    await runQuery(`DELETE FROM GLOBAL WHERE guild_id LIKE "${guild.id}"`);
    //await runQuery(`DROP TABLE IF EXISTS "${guild.id}"`);

    let guildsCount = await client.guilds.cache.size || 0;

    try{
      await client.user.setActivity(`For /help in ${guildsCount} ${guildsCount > 1 ? "servers" : "server"}`, {type: "WATCHING"});
    }catch(error){
      await errorLogger(client, null, error, "src/commands/guildDelete.js : 13");
    }
    
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);
    
    const logTitle = `[-] Server (${client.guilds.cache.size})`;
       
    const logText = `**NAME**- \`\`\`fix\n${guild.name}\n\`\`\`
    **ID**- \`\`\`fix\n${guild.id}\n\`\`\``;
      
    const logColor = embedConfig.errorColor;

    await logger(client, logTitle, logText, logColor, errorLogger);
  },
};