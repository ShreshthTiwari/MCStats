const commandUsed = new Set();

module.exports = {
  name: 'interactionCreate',
  async execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger, interaction) {
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);
      
    if(interaction.user.bot){
      return;
    }
      
    if (!interaction.isCommand()) return;

    let commandName = interaction.commandName;
  
    const command = client.commands.get(commandName);
  
    if (!command) return;
  
    await interaction.deferReply({ephemeral: true});
  
    const tick = "✅";
    const cross = "❌";
  
    try {
      const database = await databaseBuilder(client, interaction);

      if(!(commandName === "invite" || commandName === "bot" || commandName === "support" || commandName === "status" || commandName === "ping" || commandName === "vote" || commandName === "ip")){
        try{
          if(interaction.member){
            let owner = await interaction.guild.fetchOwner();

            if(owner && interaction.member.id !== owner.id){
              if(interaction.member.permissions){
                if((!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) && interaction.user.id !== config.authorID){
                  embed.setDescription(`${cross} Missing Permission- \`ADMINISTRATOR\`.`)
                    .setColor(embedConfig.errorColor);
            
                  await interaction.editReply({embeds: [embed]}).catch(async error => {
                    await errorLogger(client, interaction, error, "src/commands/interactionCreate.js : 41");
                  });
            
                  return;
                }
              }
            }
          }
        }catch{}
      }
  
      if (commandUsed.has(interaction.user.id)) {
        embed.setDescription(`${cross} Please wait for 3 seconds before using the command.`)
        .setColor(embedConfig.errorColor);

        await interaction.editReply({embeds: [embed]}).catch(async error => {
          await errorLogger(client, interaction, error, "src/commands/interactionCreate.js : 57");
        });

        return;
      }else{
        await command.execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger);

        commandUsed.add(interaction.user.id);
        
        setTimeout(() => {
          commandUsed.delete(interaction.user.id);
        }, 3 * 1000);
      }
    }catch(error){
      embed.setDescription(`${cross} Error while executing this command.\n\`\`\`\n${error}\n\`\`\``)
        .setColor(embedConfig.errorColor);
  
      await interaction.editReply({ embeds: [embed]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/interactionCreate.js : 75");
      });
    }
  },
};