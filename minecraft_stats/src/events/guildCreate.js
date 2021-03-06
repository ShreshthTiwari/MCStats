const runQuery = require("../sqlite/runQuery.js");

let i = 0;

module.exports = {
  name: "guildCreate",
  async execute(
    client,
    embed,
    MessageEmbed,
    config,
    embedConfig,
    Permissions,
    messageEmojisReplacer,
    errorLogger,
    logger,
    guild
  ) {
    await runQuery(
      `INSERT OR IGNORE INTO GLOBAL (guild_id, hidden_ports, display_uptime, fake_players_online, players_growth_percent) VALUES ("${guild.id}", "false", "true", "false", "false")`
    );

    embed = new MessageEmbed().setColor(embedConfig.defaultColor);

    let guildOwner = await guild.fetchOwner();

    const logTitle = `[+] Server (${client.guilds.cache.size})`;

    const logText = `**NAME**- \`\`\`fix\n${guild.name}\n\`\`\`
    **ID**- \`\`\`fix\n${guild.id}\n\`\`\`
    **MEMBERS**- \`\`\`fix\n${guild.memberCount}\n\`\`\`
    **OWNER**- \`\`\`fix\n${guildOwner.displayName}\n\`\`\``;

    const logColor = embedConfig.successColor;

    await logger(client, logTitle, logText, logColor, errorLogger);

    try {
      const guildJoinImages = config.guildJoinImages;

      embed = new MessageEmbed()
        .setColor(embedConfig.defaultColor)
        .setThumbnail("https://i.ibb.co/CvZ3bFp/grass.gif")
        .setDescription(
          `> Thank you for inviting me to the server.
        > Use the command \`/help\` to see all the available commands.`
        )
        .setImage(guildJoinImages[i++])
        .setFooter({ text: `- ShreshthTiwari#6014` });

      await guild.channels.cache
        .filter((ch) => ch.type == "GUILD_TEXT")
        .first()
        .send({ embeds: [embed] })
        .catch((error) => {});

      if (i >= guildJoinImages.length) {
        i = 0;
      }
    } catch (error) {
      await errorLogger(client, null, error, "src/events/guildCreate.js : 52");
    }
  },
};
