let { SlashCommandBuilder } = require('@discordjs/builders');

const playerUUIDFetcher = require("../fetcher/playerUUIDFetcher.js");
const playerNameFetcher = require("../fetcher/playerNameFetcher.js");
const playerStatusFetcher = require("../fetcher/playerStatusFetcher.js");
const playerNameHistoryFetcher = require("../fetcher/playerNameHistoryFetcher.js");

async function validUUID(UUID){
  return /^[A-Za-z0-9]*$/.test(UUID);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('player')
	.setDescription('Get information about a minecraft player.')
    .addSubcommand(subcommand =>
      subcommand.setName('info_by_username').setDescription("Get information about a minecraft player with username.")
        .addStringOption(option => option.setName("username").setDescription("Uername of minecraft player.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('info_by_uuid').setDescription("Get information about a minecraft player with UUID.")
        .addStringOption(option => option.setName("uuid").setDescription("UUID of minecraft player.").setRequired(true))
    ),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger){
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    async function setPlayerImage(name){
      try{
        let playerStatus = await playerStatusFetcher(name);
  
        if(playerStatus){
          embed.setThumbnail(playerStatus.skin.avatar)
          .setImage(playerStatus.skin.fullBody)
          .addField("SKIN", `[__DOWNLOAD__](${playerStatus.skin.texture.download})`);
        }
      }catch (error){
        console.log(error);
      }
    }

    const subCommand = await interaction.options.getSubcommand();

    let username = await interaction.options.getString("username");
    let uuid = await interaction.options.getString("uuid");

    if(username){
      uuid = await playerUUIDFetcher(username);

      if(!uuid){
        embed.setDescription(`No minecraft player found with the username- \`${username}\``)
          .setColor(embedConfig.errorColor);
        
        await interaction.editReply({embeds: [embed]}).catch(error => {});

        return;
      }

      username = await playerNameFetcher(uuid);
    }else if(uuid){
      if((uuid.length !== 32) || (! await validUUID(uuid))){
        embed.setDescription(`Invalid UUID- \`${uuid}\`.`)
          .setColor(embedConfig.errorColor);
      
        await interaction.editReply({embeds: [embed]}).catch(erorr => {});
  
        return;
      }

      username = await playerNameFetcher(uuid);

      if(!username){
        embed.setDescription(`No minecraft player UUID found with the username- \`${username}\``)
          .setColor(embedConfig.errorColor);
        
        await interaction.editReply({embeds: [embed]}).catch(error => {});
  
        return;
      }
    }

    embed.addFields({
        name: "USERNAME",
        value: `\`\`\`fix\n${username}\n\`\`\``
      },
      {
        name: "UUID",
        value: `\`\`\`fix\n${uuid}\n\`\`\``
      })
      .setColor(embedConfig.successColor);


      const playerNameHistory = await playerNameHistoryFetcher(uuid);

    let namesList = "";

    let i = 0;

    playerNameHistory.forEach(async name => {
      let dateText = '';

      if(name.changedToAt){
        dateText = `   [${new Date(name.changedToAt).toLocaleString()}]`;
      }

      namesList += ++i + '. ' + name.name + dateText + "\n";
    });

    if(namesList && namesList.length > 0){
      embed.addField("NAME HISTORY", `\`\`\`fix\n${namesList}\n\`\`\``);
    }

    await setPlayerImage(username);
    
    await interaction.editReply({embeds: [embed]}).catch(erorr => {});
  },
}