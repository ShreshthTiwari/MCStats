const { SlashCommandBuilder } = require('@discordjs/builders');

const { ChannelType } = require("discord-api-types/v9");

const databaseBuilder = require("../builder/databaseBuilder.js");

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
      subcommand.setName('hidden_ports').setDescription("Hide or show the server port in server status.")
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
      subcommand.setName('numeric_ip').setDescription("Set numeric IP of the minecraft server.")
        .addStringOption(option => option.setName("ip").setDescription("Provide the numeric server IP.").setRequired(true))
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
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    let subCommand = await interaction.options.getSubcommand();

    let channel = await interaction.options.getChannel("channel") || interaction.channel;
    let input = await interaction.options.getString("ip") || interaction.options.getInteger("port") || (interaction.options.getBoolean("option") + "");
    
    let gDB = await databaseBuilder(client, "global");
    let interval = (await gDB.get("interval") * 1) || 2;
    
    if(subCommand === "help"){
      embed.setDescription
       (`**Set Help**
        **~~------------------------------------------~~**
        > **__Variables__**
        > /set help **-** *See this help message*.
        > /set ip \`<IP>\` **-** *Set IP of your minecraft server*.
        > /set query_port \`<port>\` **-** *Set QUERY PORT of your minecraft server*.
        > /set java_port \`<port>\` **-** *Set JAVA PORT of your minecraft server*.
        > /set bedrock_port \`<port>\` **-** *Set BEDROCK PORT of your minecraft server*.
        > /set server_status_channel \`<channel>\` **-** *Set the Text Channel where the Minecraft Server Status will be posted*.
        > /set bot_updates_channel \`<channel>\` **-** *Set the Text Channel where the bot updates will be posted*.
        > /set hidden_ports \`<option>\` **-** *Hide or show the server port in server status*.
        **~~------------------------------------------~~**
        **Note-**
        > Provide the values as \`1\` or \`null\` to clear them from the database.
        **~~------------------------------------------~~**
       `)
        .setColor(embedConfig.defaultColor);

      await interaction.editReply({embeds: [embed]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/set.js : 80");
      });
    }else if(subCommand === "server_status_channel" || subCommand === "bot_updates_channel"){
      await database.set(subCommand, channel.id);

      let extraText = "";

      if(subCommand === "server_status_channel"){
        await database.set("statsEnabled", "true");
        
        extraText = `**NOTE**\nStats are updated every \`${interval+1} minutes\`.`
      }
  
      embed.setDescription(`${tick} Set ${channel} as minecraft \`${subCommand.replace("_", " ").replace("_", " ")}\`\n${extraText}`)
        .setColor(embedConfig.successColor);
  
      await interaction.editReply({embeds: [embed]}).catch(async error => {
        await errorLogger(client, interaction, error, "src/commands/set.js : 97");
      });
    }else{
      input = input + "";

      if((subCommand === "ip") && input.includes(":")){
        input = input.split(':')[0];
      }

      if((!input) || input.toLowerCase() === "null" || input.toLowerCase() === "-1"){
        await database.set(subCommand, null);

        embed.setDescription(`${tick} Cleared the value of \`${subCommand.replace("_", " ")}\`.`)
          .setColor(embedConfig.successColor);
  
        await interaction.editReply({embeds: [embed]}).catch(async error => {
          await errorLogger(client, interaction, error, "src/commands/set.js : 113");
        });
      }else{
        if(input.includes(" ")){
          input = input.split(" ");
          input = input[0];
        }
  
        await database.set(subCommand, input);
        
        embed.setDescription(`${tick} Set \`${subCommand}\` as \`${input}\`.`)
          .setColor(embedConfig.successColor);
  
        await interaction.editReply({embeds: [embed]}).catch(async error => {
          await errorLogger(client, interaction, error, "src/commands/set.js : 127");
        });
      }
    }
  },
}