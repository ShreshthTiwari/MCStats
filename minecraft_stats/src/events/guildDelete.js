const runQuery = require("../sqlite/runQuery.js");

module.exports = {
  name: "guildDelete",
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
    await runQuery(`DELETE FROM GLOBAL WHERE guild_id LIKE "${guild.id}"`);

    embed = new MessageEmbed().setColor(embedConfig.defaultColor);

    const logTitle = `[-] Server (${client.guilds.cache.size})`;

    const logText = `**NAME**- \`\`\`fix\n${guild.name}\n\`\`\`
    **ID**- \`\`\`fix\n${guild.id}\n\`\`\``;

    const logColor = embedConfig.errorColor;

    await logger(client, logTitle, logText, logColor, errorLogger);
  },
};
