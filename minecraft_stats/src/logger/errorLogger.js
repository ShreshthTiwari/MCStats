const config = require("../config/config.json");
const embedConfig = require("../config/embedConfig.json");
const { MessageEmbed } = require("discord.js");

module.exports = async (client, interaction, error, loc) => {
  const embed = new MessageEmbed().setColor(embedConfig.errorColor);

  const channel = await client.channels.cache.get(config.errorLogsChannel);

  if (channel) {
    if (interaction && interaction.guild) {
      embed.addFields(
        {
          name: "GUILD",
          value: `\`${interaction.guild.name}\` **|** \`${interaction.guild.id}\``,
        },
        {
          name: "USER",
          value: `\`${interaction.user.tag}\` **|** \`${interaction.user.id}\``,
        },
        {
          name: "COMMAND",
          value: `\`/${interaction.commandName}\``,
        }
      );
    }

    if (error) {
      if (error.length > 1200) {
        error.length = 1197;
        error = error + "...";
      }

      embed.addField("ERROR", `\`\`\`${error}\`\`\``);
    }

    if (loc) {
      embed.addField("CODE LOC", `\`\`\`${loc}\`\`\``);
    }

    embed.setTimestamp();

    await channel.send({ embeds: [embed] }).catch((error) => {});
  }
};
