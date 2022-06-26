const { SlashCommandBuilder } = require('@discordjs/builders');

const { ChannelType } = require("discord-api-types/v9");

const runQuery = require("../sqlite/runQuery.js");
const emojisFetcher = require("../fetcher/emojisFetcher.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set')
	  .setDescription('Set variables for the bot.')
    .addSubcommand(subcommand =>
      subcommand.setName('bedrock_port').setDescription("Set port of the minecraft bedrock server.")
        .addIntegerOption(option => option.setName("port").setDescription("Provide the server port.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('bot_updates_channel').setDescription("Set bot updates channel.")
        .addChannelOption(option => option.setName("channel").setDescription("Select a channel.").addChannelTypes([ChannelType.GuildText, ChannelType.GuildNews]))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('help').setDescription("Help for /set command.")
    )
    .addSubcommand(subcommand =>
      subcommand.setName('display_uptime').setDescription("Hide or show the downtime in server status.")
        .addBooleanOption(option => option.setName("option").setDescription("Set TRUE or FALSE.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('hidden_ports').setDescription("Hide or show the server port in server status.")
        .addBooleanOption(option => option.setName("option").setDescription("Set TRUE or FALSE.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('fake_players_online').setDescription("Hide or show fake players count in server status.")
        .addBooleanOption(option => option.setName("option").setDescription("Set TRUE or FALSE.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('ip').setDescription("Set ip of the minecraft server.")
        .addStringOption(option => option.setName("ip").setDescription("Provide the server IP.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('java_port').setDescription("Set port of the minecraft java server.")
        .addIntegerOption(option => option.setName("port").setDescription("Provide the server port.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('query_port').setDescription("Set query port of the minecraft java server.")
        .addIntegerOption(option => option.setName("port").setDescription("Provide the server port.").setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand.setName('server_status_channel').setDescription("Set channel where it will show auto updating server status.")
        .addChannelOption(option => option.setName("channel").setDescription("Select a channel.").addChannelTypes([ChannelType.GuildText, ChannelType.GuildNews]))
    ),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger) {
    const interval = config.interval;

    const emojis = await emojisFetcher(client);
    const branch = await emojis.branch;
    const branchEnd = await emojis.branchEnd;

    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    let subCommand = await interaction.options.getSubcommand();

    let channel = await interaction.options.getChannel("channel") || interaction.channel;
    let input = await interaction.options.getString("ip") || interaction.options.getInteger("port") || (interaction.options.getBoolean("option") + "");

    if(input && input.length >= 100){
      input.length = 97;
      input = input + '...';
    }
        
    if(subCommand === "help"){
      embed.setTitle("Set Help 🔁")
      .addFields({
        name: "Variables",
        value: `
        > • \`/set help\`
        > • \`/set ip\`
        > • \`/set query_port\`
        > • \`/set java_port\`
        > • \`/set bedrock_port\`
        > • \`/set server_status_channel\`
        > • \`/set bot_updates_channel\`
        > • \`/set hidden_ports\`
        > • \`/set fake_players_online\`
        > • \`/set display_uptime\``
      },
      {
        name: "Note-",
        value: `
        > • Provide the values as \`-1\` or \`null\` to clear them from the database.
        `
      })
      .setColor(embedConfig.defaultColor);

      await interaction.editReply({embeds: [embed]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/set.js : 90");
      });
    }else if(subCommand === "server_status_channel" || subCommand === "bot_updates_channel"){
      await runQuery(`UPDATE GLOBAL SET ${subCommand} = "${channel.id}" WHERE guild_id LIKE "${interaction.guild.id}"`);

      let extraText = "";

      if(subCommand === "server_status_channel"){
        extraText = `**NOTE**\nStats are updated every \`${interval} minutes\`.`
      }

      extraText += `\nPlease make sure I have the following permissions in ${channel}-
      • \`VIEW CHANNEL\`
      • \`SEND MESSAGES\`
      ${branchEnd} \`READ MESSAGE HISTORY\``;
  
      embed.setDescription(`${tick} Set ${channel} as \`${subCommand.replace("_", " ").replace("_", " ")}\`\n-------------------------\n${extraText}`)
        .setColor(embedConfig.successColor);
  
      await interaction.editReply({embeds: [embed]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/set.js : 110");
      });
    }else{
      input = input + "";

      if((subCommand === "ip") && input.includes(":")){
        input = input.split(':')[0];
      }

      if((!input) || input.toLowerCase() === "null" || input.toLowerCase() === "-1"){
        await runQuery(`UPDATE GLOBAL SET ${subCommand} = null WHERE guild_id LIKE "${interaction.guild.id}"`);

        embed.setDescription(`${tick} Cleared the value of \`${subCommand.replace("_", " ")}\`.`)
          .setColor(embedConfig.successColor);
  
        await interaction.editReply({embeds: [embed]}).catch(async error => {
          await errorLogger(client, interaction, error, "src/commands/set.js : 126");
        });
      }else{
        if(input.includes(" ")){
          input = input.split(" ");
          input = input[0];
        }else if(! isNaN(input)){
          if(input < 1 || input > 65535){
            embed.setDescription(`Invalid port number- \`${input}\`.`)
              .setColor(embedConfig.errorColor);
  
            await interaction.editReply({embeds: [embed]}).catch(async error => {
              await errorLogger(client, interaction, error, "src/commands/set.js : 138");
            });

            return;
          }
        }
  
        await runQuery(`UPDATE GLOBAL SET ${subCommand} = "${input}" WHERE guild_id LIKE "${interaction.guild.id}"`);
        
        embed.setDescription(`${tick} Set \`${subCommand}\` as \`${input}\`.`)
          .setColor(embedConfig.successColor);

        if(subCommand === "ip"){
          await runQuery(`UPDATE GLOBAL SET downtime = 0, total = 0 WHERE guild_id LIKE "${interaction.guild.id}"`);
        }
  
        await interaction.editReply({embeds: [embed]}).catch(async error => {
          await errorLogger(client, interaction, error, "src/commands/set.js : 155");
        });
      }
    }
  },
}