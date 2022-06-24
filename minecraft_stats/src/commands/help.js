const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, Permissions } = require("discord.js");

const emojisFetcher = require("../fetcher/emojisFetcher.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
	  .setDescription('Show help message.'),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger){
    const emojis = await emojisFetcher(client);
    const branch = await emojis.branch;
    const branchEnd = await emojis.branchEnd;
    
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

    await embed.setTitle(`${client.user.username} Help`)
    .setThumbnail(client.user.displayAvatarURL({dynamic: true}));
    
    if(interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || interaction.member.id === config.authorID){
      await embed.addField("Admin 🛠️", `
      > \`/set\` **-** *Set bot variables*.
      > ${branch} \`/set help\`
      > ${branch} \`/set ip\`
      > ${branch} \`/set java_port\`
      > ${branch} \`/set query_port\`
      > ${branch} \`/set bedrock_port\`
      > ${branch} \`/set server_status_channel\`
      > ${branch} \`/set bot_updates_channel\`
      > ${branch} \`/set hidden_ports\`
      > ${branchEnd} \`/set display_uptime\``)
    }

    embed.addFields({
      name: "Member 👥",
      value: `
      > \`/help\` **-** *See this help message*.
      > \`/ip\` **-** *Check the IP of the minecrtaft server*.
      > \`/ping\` **-** *Check status of a minecraft server*.
      > ${branch} \`/ping java\`
      > ${branchEnd} \`/ping bedrock\`
      > \`/status\` **-** *Check status of the minecraft server*.
      > \`/player\` **-** *Check account details of a minecraft player*.
      > ${branch} \`/player info_by_username\`
      > ${branchEnd} \`/player info_by_uuid\`
      > \`/mojang status\` **-** *Check status of mojang*.`
    },
    {
      name: "Miscellaneous 💠",
      value: `
      > \`/bot ping\` **-** *Check bot's ping*.
      > \`/bug\` **-** *Send bug report to bot developer*. 
      > \`/invite\` **-** *Get the bot's invite link*.
      > \`/support\` **-** *Get the invite link of the support server*.`
    },
    {
      name: "Note-",
      value: `To reset the server uptime, set your server IP again.
      To clear value of a variable, set it as \`-1\` or \`null\``
    });

    await interaction.editReply({embeds: [embed], components: [buttons]}).catch(async error => {
      await errorLogger(client, interaction, error, "src/commands/help.js : 93");
    });
  },
}