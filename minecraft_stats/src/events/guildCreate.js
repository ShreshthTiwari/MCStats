const runQuery = require("../sqlite/runQuery.js");

let i = 0;

module.exports = {
  name: 'guildCreate',
  async execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger, guild) {
    await runQuery(`INSERT OR IGNORE INTO GLOBAL (guild_id, hidden_ports, display_downtime) VALUES ("${guild.id}", "false", "true")`);
    
    let guildsCount = await client.guilds.cache.size || 0;

    try{
      await client.user.setActivity(`For /help in ${guildsCount} ${guildsCount > 1 ? "servers" : "server"}`, {type: "WATCHING"});
    }catch(error){
      await errorLogger(client, null, error, "src/commands/guildCreate.js : 16");
    }
    
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);
    
    let guildOwner = await guild.fetchOwner();

    const logTitle = `[+] Server (${client.guilds.cache.size})`;  
      
    const logText = `**NAME**- \`\`\`${guild.name}\`\`\`
    **ID**- \`\`\`${guild.id}\`\`\`
    **MEMBERS**- \`\`\`${guild.memberCount}\`\`\`
    **OWNER**- \`\`\`${guildOwner.displayName}\`\`\``;
      
    const logColor = embedConfig.successColor;

    await logger(client, logTitle, logText, logColor, errorLogger);

    try{
      const guildJoinImages = config.guildJoinImages;
  
      embed = new MessageEmbed()
        .setColor(embedConfig.defaultColor)
        .setThumbnail("https://i.ibb.co/CvZ3bFp/grass.gif")
        .setDescription(`> Thank you for inviting me to the server.
        > Use the command \`/help\` to see all the available commands.`)
        .setImage(guildJoinImages[i++])
        .setFooter({text: `- ShreshthTiwari#6014`});
  
      await guild.channels.cache.filter(ch => ch.type == "GUILD_TEXT").first().send({embeds: [embed]}).catch(error => {});

      if(i >= guildJoinImages.length){
        i = 0;
      }
    }catch(error){
      console.log(error);
    }
  },
};