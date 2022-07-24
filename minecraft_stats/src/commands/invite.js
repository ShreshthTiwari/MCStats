const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite bot to your server."),

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
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

    const inviteButton = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Invite me")
        .setStyle("LINK")
        .setURL(config.inviteLink)
    );

    await embed
      .setDescription(`[**__B0T INVITE LINK__**](${config.inviteLink})`)
      .setColor(embedConfig.defaultColor);

    await interaction
      .editReply({ embeds: [embed], components: [inviteButton] })
      .catch(async (error) => {
        await errorLogger(
          client,
          interaction,
          error,
          "src/commands/invite.js : 26"
        );
      });
  },
};
