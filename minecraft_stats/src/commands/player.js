let { SlashCommandBuilder } = require('@discordjs/builders');

const playerUUIDFetcher = require("../fetcher/playerUUIDFetcher.js");
const playerNameFetcher = require("../fetcher/playerNameFetcher.js");
const playerStatusFetcher = require("../fetcher/playerStatusFetcher.js");
const playerNameHistoryFetcher = require("../fetcher/playerNameHistoryFetcher.js");

async function isValidUUID(UUID){
  if(UUID.length !== 32){
    return false;
  }

  return /^[A-Za-z0-9]*$/.test(UUID);
}

async function isValidUsername(Username){
  if(Username.length < 3 || Username.length > 16){
    return false;
  }

  return /^[A-Za-z0-9_]*$/.test(Username);
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

    let username = await interaction.options.getString("username");
    let uuid = await interaction.options.getString("uuid");

    if(username){
      if(! await isValidUsername(username)){
        embed.setDescription(`Invalid username- \`${username}\`.`)
          .setColor(embedConfig.errorColor);
        
        await interaction.editReply({embeds: [embed]}).catch(error => {});
  
        return;
      }

      uuid = await playerUUIDFetcher(username);

      if(!uuid){
        embed.setDescription(`No minecraft player found with the username- \`${username}\``)
          .setColor(embedConfig.errorColor);
        
        await interaction.editReply({embeds: [embed]}).catch(error => {});

        return;
      }

      username = await playerNameFetcher(uuid);
    }else if(uuid){
      if(! await isValidUUID(uuid)){
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

    for(let i=0; i<=Object.keys(playerNameHistory).length - 1; i++){
      if(playerNameHistory[i].changedToAt){
        let date = `<t:${Math.round(new Date(playerNameHistory[i].changedToAt).getTime()/1000)}:R>`;
        namesList += `\`${playerNameHistory[i].name}\`  **|**  ${date}\n`;
      }else{
        namesList += `\`${playerNameHistory[i].name}\`\n`;
      }
    }

    if(namesList && namesList.length > 0){
      embed.addField("NAME HISTORY", namesList);
    }

    await setPlayerImage(username);
    
    await interaction.editReply({embeds: [embed]}).catch(async error => {
      await errorLogger(client, interaction, error, "src/commands/player.js : 133");
    });
  },
}