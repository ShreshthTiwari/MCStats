const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const databaseBuilder = require("../builder/databaseBuilder.js");

const pageBuilder = require("../builder/pageBuilder.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot')
	  .setDescription('Bot commands help.')
    .addSubcommand(subcommand =>
      subcommand.setName('avatar').setDescription("Change avatar of the bot.")
        .addStringOption(option => option.setName("avatar_url").setDescription("avatar URL.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('guildslist').setDescription("List of guilds bot is in.")
    )
    .addSubcommand(subcommand =>
      subcommand.setName('help').setDescription("This help message.")
    )
    .addSubcommand(subcommand =>
      subcommand.setName('rename').setDescription("Rename the bot.")
        .addStringOption(option => option.setName("name").setDescription("Name.").setRequired(true))
    )
    .addSubcommand(subcommand => subcommand.setName('ping').setDescription("Check the bot's ping."))
    .addSubcommand(subcommand =>
      subcommand.setName('updates').setDescription("Send bot updates.")
        .addStringOption(option => option.setName("message").setDescription("Provide the message.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('msg_owners').setDescription("Send message to owner of each guild .")
        .addStringOption(option => option.setName("message").setDescription("Provide the message.").setRequired(true))
    ),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger) {
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);
      
    let authorID = await config.authorID;

    const subCommand = await interaction.options.getSubcommand();

    let input = await interaction.options.getString("name") || interaction.options.getString("avatar") || interaction.options.getString("message");

    let pno = 1;

    if(subCommand !== "ping" && subCommand !== "help" && interaction.user.id !== authorID){
      await embed.setDescription(`${cross} Developer only command.`)
        .setColor(embedConfig.errorColor);

      await interaction.editReply({embeds: [embed]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/bot.js : 53");
      });

      return;
    }
   
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
    
    let guildsListIDsMap;
    
    const fbButtons = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("previous") 
          .setLabel("Previous")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle("PRIMARY")
      );

    async function sendGuildsList(input){
      const data = await pageBuilder(input, guildsListIDsMap);
  
      let start = data[0] || 0;
      let stop = data[1] || 9;
      let page = data[2] || 1;
      let pages = data[3] || 1;

      let guildsList = [];

      for(let i=start; i<=stop; i++){
        const guild = await client.guilds.cache.get(guildsListIDsMap[i]);

        if(guild){
          let invite;
          try{
            invite = await guild.channels.cache.first().createInvite({
              maxAge: 86400,
              maxUses: 1
            });
          }catch{}
            
          guildsList[i] = `==========\n\`\`\`${i+1}. Name- ${guild.name}\nID- ${guild.id}\nMembers- ${guild.memberCount}\`\`\``;
  
          if(invite){
            guildsList[i] = guildsList[i] + `\n${invite}`;
          }
        }
      }

      guildsList = await guildsList.join("\n");
      guildsList = guildsList + "\n==========";
        
      await embed.setAuthor({name: `${guildsListIDsMap.length} Guilds`})
        .setDescription(guildsList)
        .setFooter({text: `Page- ${page}/${pages}`});
    
      let p = false;
      let n = false;
    
      if(page === 1 && pages === 1){
        p = n =true;
       }else if(page === 1){
        p = true;
        n = false;
       }else if(page === pages){
        p = false;
        n = true
      }
    
      fbButtons.components[0].setDisabled(p);
      fbButtons.components[1].setDisabled(n);

      await interaction.editReply({embeds: [embed], components: [fbButtons]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/bot.js : 145");
      });
    }
    
    collector.on('collect', async button => {
      if(button.customId === "vote"){
        const voteEmbed = new MessageEmbed()
        .setTitle("VOTE ME")
        .setDescription(config.votingLink)
        .setColor(embedConfig.defaultColor);
      
        await button.reply({embeds: [voteEmbed]});
      }else{
        if (button.customId === 'previous') {
          pno--;
        }else if(button.customId === 'next'){
          pno++;
        }
      
        await button.reply({content: '*'}).then(async () => {
          await button.deleteReply();
        });
    
        await sendGuildsList(pno);
      }
    });

    await embed.setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL({dynamic: true})})
      .setThumbnail(client.user.displayAvatarURL({dynamic: true}))
      .setColor(embedConfig.defaultColor);

    if(subCommand === "help"){
      if(interaction.user.id !== authorID){
        await embed.setTitle("Bot Commands Help")
          .setDescription
           (`
            > /bot ping **-** *Check bot's ping*.
           `); 
      }else{
        await embed.setTitle("Bot Commands Help")
          .setDescription
           (`
            > __/bot avatar \`<url>\`__ **-** *Set the bot's avatar*.
            > __/bot guilds_list__ **-** *Get a list of guilds bot is in*.
            > __/bot help__ **-** *See this help message*.
            > __/bot ping__ **-** *Check bot's ping*.
            > __/bot rename \`<name>\`__ **-** *Rename the bot*.
            > __/bot updates \`<message>\`__ **-** *Send bot updates*.
           `); 
      }

      await interaction.editReply({embeds: [embed], components: [buttons]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/bot.js : 197");
      });
    }else if(subCommand === 'rename'){
      let newname = input;
      let name = client.user.username;
        
      await client.user.setUsername(newname);

      await embed.setDescription(`${tick} **~~${name}~~** renamed to **${newname}**`)
        .setColor(embedConfig.successColor);

      await interaction.editReply({embeds: [embed]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/bot.js : 209");
      });
    }else if(subCommand === "avatar"){
      let avatarlink = input;

      await client.user.setAvatar(avatarlink);
        
      await embed.setDescription(`${tick} ${client.user.username}'s avatar changed-\n`)
        .setImage(avatarlink)
        .setColor(embedConfig.successColor);

      await interaction.editReply({embeds: [embed]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/bot.js : 221");
      });
    }else if(subCommand === "ping"){
      const yourPing = new Date().getTime() - interaction.createdTimestamp;
      const botPing = Math.round(client.ws.ping);
      const time = new Date().getTime();
      const db = await database.get("1");
      const dbPing = new Date().getTime() - time;

      await embed.setDescription
       (`
        > **Your Latency**-
        \`\`\`fix\n${yourPing}ms.\n\`\`\`\n
        > **Bot Latency**-
        \`\`\`fix\n${botPing}ms.\n\`\`\`\n
        > **Database Latency**-
        \`\`\`fix\n${dbPing}ms.\n\`\`\`\n
       `); 

      await interaction.editReply({embeds: [embed], components: [buttons]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/bot.js : 241");
      });
    }else if(subCommand === 'guildslist'){
      guildsListIDsMap = await client.guilds.cache
        .sort((a, b) => a.position - b.position)
        .map(g => g.id);

      pno = 1;

      await sendGuildsList(1);
    }else if(subCommand === 'updates'){
      while(input.includes("<nl>")){
        input = await input.replace("<nl>", "\n");
      }

      input = await messageEmojisReplacer(client, interaction, input);

      if(input.length > 1900){
        input.length = 1897;
        input = input + "...";
      }

      updatesEmbed = new MessageEmbed()
        .setTitle(`${client.user.username} UPDATES`)
        .setColor(embedConfig.defaultColor)
        .setDescription(input);

      let guildsListIDsMap = await client.guilds.cache
        .sort((a, b) => a.position - b.position)
        .map(g => g.id);
      
      let sent = [];

      for(let i=0; i<=guildsListIDsMap.length-1; i++){
        let guild = await client.guilds.cache.get(guildsListIDsMap[i]);          
        
        if(guild){
          database = await databaseBuilder(client, interaction);

          let botUpdatesChannelID = await database.get("bot_updates_channel");
         
          if(botUpdatesChannelID){
            let botUpdatesChannel = await guild.channels.cache.get(botUpdatesChannelID);

            if(botUpdatesChannel){
              await botUpdatesChannel.send({embeds: [updatesEmbed], components: [buttons]}).catch(error => {});
            }
          }else{
            let owner = await guild.fetchOwner();

            if(owner){
              await updatesEmbed.setAuthor({name: guild.name, iconURL: guild.iconURL({ dynamic:true })})
                .setDescription(input + `\n\n----------------------------------\n\`To disable bot updates in DM, please set a bot updates channel in your discord server\`.\nCommand- \`/set bot_updates_channel <channel>\`.\n:heart:`)
  
              if(sent.includes(owner.id)){
                continue;
              }else{
                await owner.send({embeds: [updatesEmbed], components: [buttons]}).catch(error => {});
                sent[sent.length] = owner.id;
              }
            }
          }
        }
      }

      await embed.setDescription(`${tick} Bot updates sent.`)
        .setColor(embedConfig.successColor);

      await interaction.editReply({embeds: [embed], ephemeral: true});
    }else if(subCommand === 'msg_owners'){
      while(input.includes("<nl>")){
        input = await input.replace("<nl>", "\n");
      }

      input = await messageEmojisReplacer(client, interaction, input);

      if(input.length > 1900){
        input.length = 1897;
        input = input + "...";
      }

      updatesEmbed = new MessageEmbed()
        .setTitle(`${client.user.username} New Message`)
        .setColor(embedConfig.defaultColor)
        .setDescription(input);

      let guildsListIDsMap = await client.guilds.cache
        .sort((a, b) => a.position - b.position)
        .map(g => g.id);
      
      let sent = [];

      for(let i=0; i<=guildsListIDsMap.length-1; i++){
        let guild = await client.guilds.cache.get(guildsListIDsMap[i]);          
        
        if(guild){
          let owner = await guild.fetchOwner();

          if(owner){
            await updatesEmbed.setAuthor({name: guild.name, iconURL: guild.iconURL({ dynamic:true })});

            if(sent.includes(owner.id)){
              continue;
            }else{
              await owner.send({embeds: [updatesEmbed], components: [buttons]}).catch(error => {});
              sent[sent.length] = owner.id;
            }
          }
        }
      }

      await embed.setDescription(`${tick} Message sent.`)
        .setColor(embedConfig.successColor);

      await interaction.editReply({embeds: [embed], ephemeral: true});
    }
  },
}