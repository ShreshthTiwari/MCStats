const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('support')
  	.setDescription('Support server invite link.'),
  
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

    await embed.setDescription(`[**__JOIN B0T SUPPORT SERVER__**](${config.supportLink})`)
      .setColor(embedConfig.defaultColor);
    
    await interaction.editReply({embeds: [embed], components: [buttons]}).catch(async error => {
      await  errorLogger(client, interaction, error, "src/commands/support.js : 43");
    });
  },
}