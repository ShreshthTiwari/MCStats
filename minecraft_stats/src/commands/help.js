const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
  	.setDescription('Show help message.'),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger){
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);
    
    const buttons = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("vote")
          .setLabel("Vote me")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setLabel("Support")
          .setStyle("LINK")
          .setURL(config.supportLink),
        new MessageButton()
          .setLabel("Invite me")
          .setStyle("LINK")
          .setURL(config.inviteLink)
      );

    const collector = await interaction.channel.createMessageComponentCollector();
    
    collector.on('collect', async button => {
      if(button.customId === "vote"){
        const voteEmbed = new MessageEmbed()
        .setTitle("VOTE ME")
        .setThumbnail(client.user.displayAvatarURL({dynamic: true}))
        .setDescription(config.votingLink)
        .setColor(embedConfig.defaultColor);
      
        await button.reply({embeds: [voteEmbed], ephemeral: true});
      }
    });

    await embed.setDescription(`
    **~~------------------------------------------~~**
    > **MCStats-B0T Help**
    **~~------------------------------------------~~**
    > __/help__ **-** *See this help message*.
    > __/ip__ **-** *Check the IP of the minecrtaft server*.
    > __/ping__ **-** *Check status of a minecraft server*.
    > __/set help__ **-** *Set bot variables*.
    > __/status__ **-** *Check status of the minecraft server*.
    **~~------------------------------------------~~**
    > __/bug__ \`<message>\` **-** *Send bug report to bot developer*. 
    > __/invite__ **-** *Get the bot's invite link*.
    > __/support__ **-** *Get the invite link of support server*.
    **~~------------------------------------------~~**`);

    await interaction.editReply({embeds: [embed], components: [buttons]}).catch(async error => {
      await errorLogger(client, interaction, error, "src/commands/help.js : 58");
    });
  },
}