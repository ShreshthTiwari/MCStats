const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageButton, MessageActionRow, Permissions } = require("discord.js");

const emojisFetcher = require("../fetcher/emojisFetcher.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show help message."),

  async execute(
    client,
    MessageEmbed,
    embed,
    config,
    embedConfig,
    Permissions,
    interaction,
    messageEmojisReplacer,
    tick,
    cross,
    errorLogger,
    logger
  ) {
    const emojis = await emojisFetcher(client);
    const branch = await emojis.branch;
    const branchLine = await emojis.branchLine;
    const branchEnd = await emojis.branchEnd;

    embed = new MessageEmbed().setColor(embedConfig.defaultColor);

    const buttons = new MessageActionRow().addComponents(
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

    const collector =
      await interaction.channel.createMessageComponentCollector();

    collector.on("collect", async (button) => {
      if (button.customId === "vote") {
        const voteEmbed = new MessageEmbed()
          .setTitle("VOTE ME")
          .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
          .setDescription(config.votingLink)
          .setColor(embedConfig.defaultColor);

        await button.reply({ embeds: [voteEmbed], ephemeral: true });
      }
    });

    await embed
      .setTitle(`${client.user.username} Help`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

    let helpText = "";

    if (
      interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
      interaction.member.id === config.authorID
    ) {
      helpText += `
      **Admin** 🛠️
      > • \`/set\`
      > ${branch}• \`/set help\`
      > ${branch}• \`/set ip\`
      > ${branch}• **MINECRAFT**
      > ${branchLine}${branch}• **JAVA**
      > ${branchLine}${branchLine}${branch}• \`/set java_port\`
      > ${branchLine}${branchLine}${branch}• \`/set query_port\`
      > ${branchLine}${branchLine}${branchEnd}• \`/set bedrock_port\`
      > ${branchLine}${branchEnd}• **BEDROCK**
      > ${branchLine}ㅤ ${branchEnd}• \`/set bedrock_port\`
      > ${branch}• **GTA**
      > ${branchLine}${branch}• **FIVEM**
      > ${branchLine}${branchLine}${branchEnd}• \`/set fivem_port\`
      > ${branchLine}${branchEnd}• **SA-MP**
      > ${branchLine}ㅤ ${branchEnd}• \`/set samp_port\`
      > ${branch}• **CHANNELS**
      > ${branchLine}${branch}• \`/set server_status_channel\`
      > ${branchLine}${branchEnd}• \`/set bot_updates_channel\`
      > ${branchEnd}• **OPTIONS**
      > ㅤ ${branch}• \`/set hidden_ports\`
      > ㅤ ${branch}• \`/set fake_players_online\`
      > ㅤ ${branch}• \`/set display_uptime\`
      > ㅤ ${branchEnd}• \`/set players_growth_percent\`
      \n`;
    }

    helpText += `
    **Member** 👥
    > • \`/help\`
    > • \`/ip\`
    > • \`/ping\`
    > ${branch}• **MINECRAFT**
    > ${branchLine}${branch}• **JAVA**
    > ${branchLine}${branchLine}${branchEnd}• \`/ping java\`
    > ${branchLine}${branchEnd}• **BEDROCK**
    > ${branchLine}ㅤ ${branchEnd}• \`/ping bedrock\`
    > ${branchEnd}• **GTA**
    > ㅤ ${branch}• **FIVEM**
    > ㅤ ${branchLine}${branchEnd}• \`/ping fivem\`
    > ㅤ ${branchEnd}• **SA-MP**
    > ㅤ ㅤ ${branchEnd}• \`/ping samp\`
    > • \`/status\`
    \n
    **Miscellaneous** 💠
    > • \`/bot ping\`
    > • \`/bug\`
    > • \`/invite\` 
    > • \`/support\`
    \n
    **Note**-
    > • To reset the server uptime and players growth percentage, set your server IP again.
    > • To clear value of a variable, set it as \`-1\` or \`null\`
    `;

    console.log(helpText.length);

    embed.setDescription(helpText);

    await interaction
      .editReply({ embeds: [embed], components: [buttons] })
      .catch(async (error) => {
        await errorLogger(
          client,
          interaction,
          error,
          "src/commands/help.js : 117"
        );
      });
  },
};
