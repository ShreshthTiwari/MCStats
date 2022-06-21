const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bug')
	  .setDescription('Send bug report to bot developer.')
	  .addStringOption(option => option.setName('message').setDescription('Enter message.').setRequired(true)),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger){
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    let message = await messageEmojisReplacer(client, interaction, interaction.options.getString('message'));

    const user = await interaction.user;

    if(message.length >= 800){
      message.length = 797;
      message = message + "...";
    }

    await embed.setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL({dynamic: true})})
      .setTitle("NEW BUG REPORT")
      .setDescription(`**USER**\n\`${user.tag}\` **|** \`${user.id}\`\n**~~------------------------------------------~~**\n**MESSAGE**\n` + message)
      .setColor(embedConfig.errorColor)
      .setThumbnail(user.displayAvatarURL({dynamic: true}));

    const channel = await client.channels.cache.get(config.bugReportsChannel);

    if(channel){
      await channel.send({embeds: [embed]})
        .then(async () => {
          embed = new MessageEmbed()
            .setDescription
             (`
              ${tick} **Sending bug report to the developer...**
              
              **~~------------------------------------------~~**
              **Need Support?**
              **[JOIN SUPPORT SERVER](${config.supportLink})**.
             `)
            .setColor(embedConfig.defaultColor);

          await interaction.editReply({embeds: [embed]})
          .catch(async error => {
            await errorLogger(client, interaction, error, "src/commands/bug.js : 46");
          });
        })
        .catch(async error => {
          await errorLogger(client, interaction, error, "src/commands/bug.js : 50");
        });
    }
  },
}