let { SlashCommandBuilder } = require('@discordjs/builders');

const playerUUIDFetcher = require("../fetcher/playerUUIDFetcher.js");
const playerNameFetcher = require("../fetcher/playerNameFetcher.js");
const playerStatusFetcher = require("../fetcher/playerStatusFetcher.js");

async function checkUUID(UUID){
  return /^[A-Za-z0-9]*$/.test(UUID);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('player')
	.setDescription('Get information about a minecraft player.')
    .addSubcommand(subcommand =>
      subcommand.setName('get_uuid').setDescription("Get UUID of a minecraft player with username.")
        .addStringOption(option => option.setName("username").setDescription("Uername of minecraft player.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('get_username').setDescription("Get username of a minecraft player with UUID.")
        .addStringOption(option => option.setName("uuid").setDescription("UUID of minecraft player.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('get_name_history').setDescription("Get name history of a minecraft player with UUID.")
        .addStringOption(option => option.setName("uuid").setDescription("UUID of minecraft player.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('status').setDescription("Get account status of a minecraft player with username.")
        .addStringOption(option => option.setName("username").setDescription("Username of minecraft player.").setRequired(true))
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

    let input = await interaction.options.getString("uuid") || await interaction.options.getString("username");

    if(subCommand === "get_uuid"){
      try{
        const uuid = await playerUUIDFetcher(input);

        if(uuid){
          input = await playerNameFetcher(uuid);

          embed.addFields({
              name: "USERNAME",
              value: `\`\`\`fix\n${input}\n\`\`\``
            },
            {
              name: "UUID",
              value: `\`\`\`fix\n${uuid}\n\`\`\``
            })
            .setColor(embedConfig.successColor);

          await setPlayerImage(input);
        }else{
          embed.setDescription(`No minecraft player found with the username- \`${input}\``)
            .setColor(embedConfig.errorColor);
        }
      }catch(error){
        embed.setDescription(`Error getting UUID of \`${input}\`-\n\`\`\`${error}\`\`\``)
          .setColor(embedConfig.errorColor);
      }
    }else if(subCommand === "get_username"){
      try{
        if((input.length !== 32) || (! await checkUUID(input))){
          embed.setDescription(`Invalid UUID- \`${input}\`.`)
            .setColor(embedConfig.errorColor);
        
          await interaction.editReply({embeds: [embed]}).catch(erorr => {});

          return;
        }
        
        const name = await playerNameFetcher(input);

        if(name){
          embed.addFields({
              name: "USERNAME",
              value: `\`\`\`fix\n${name}\n\`\`\``
            },
            {
              name: "UUID",
              value: `\`\`\`fix\n${input}\n\`\`\``
            })
            .setColor(embedConfig.successColor);

          
          await setPlayerImage(name);
        }else{
          embed.setDescription(`No minecraft player UUID found with the username- \`${input}\``)
            .setColor(embedConfig.errorColor);
        }
      }catch(error){
        embed.setDescription(`Error getting username of \`${input}\`-\n\`\`\`${error}\`\`\``)
          .setColor(embedConfig.errorColor);
      }
    }else{
      embed.setDescription(`VERY SOON!`)
        .setColor(embedConfig.defaultColor);
    }
    
    await interaction.editReply({embeds: [embed]}).catch(erorr => {});
  },
}