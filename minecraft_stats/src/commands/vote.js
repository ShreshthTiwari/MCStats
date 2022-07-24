const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription("Support me by upvoting."),

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
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setTitle("VOTE ME")
      .setDescription(config.votingLink);

    const buttons = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Support")
        .setStyle("LINK")
        .setURL(config.supportLink),
      new MessageButton()
        .setLabel("Invite me")
        .setStyle("LINK")
        .setURL(config.inviteLink)
    );

    await interaction
      .editReply({ embeds: [embed], components: [buttons] })
      .catch(async (error) => {
        await errorLogger(
          client,
          interaction,
          error,
          "src/commands/vote.js : 29"
        );
      });
  },
};
