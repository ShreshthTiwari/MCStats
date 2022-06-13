let { SlashCommandBuilder } = require('@discordjs/builders');

const mojangStatusFetcher = require("../fetcher/mojangStatusFetcher.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mojang')
  	.setDescription('Check status of mojang.')
    .addSubcommand(subcommand => subcommand.setName('status').setDescription("Check the mojang servers' status.")),
  
  async execute(client, MessageEmbed, embed, config, embedConfig, database, Permissions, interaction, messageEmojisReplacer, tick, cross, errorLogger, logger){
    embed = new MessageEmbed()
      .setColor(embedConfig.defaultColor);

    const mojangStatus = await mojangStatusFetcher();

    let skinsStatus;
    let skinsO = "🔴";

    if(mojangStatus.report.skins.status === "up"){
      skinsO = "🟢";
      skinsStatus = `**↳** UPTIME- \`${mojangStatus.report.skins.uptime}%\``;
    }else{
      skinsStatus = `**↳** UPTIME- \`${mojangStatus.report.skins.uptime}%\`
      **↳** DOWN- <t:${new Date(mojangStatus.report.skins.down_since).getTime()/1000}:R>`;
    }

    let websiteStatus;
    let websiteO = "🔴";

    if(mojangStatus.report.website.status === "up"){
      websiteO = "🟢";
      websiteStatus = `**↳** UPTIME- \`${mojangStatus.report.website.uptime}%\``;
    }else{
      websiteStatus = `**↳** UPTIME- \`${mojangStatus.report.website.uptime}%\`
      **↳** DOWN- <t:${new Date(mojangStatus.report.website.down_since).getTime()}:R>`;
    }

    let apiStatus;
    let apiO = "🔴";

    if(mojangStatus.report.api.status === "up"){
      apiO = "🟢";
      apiStatus = `**↳** UPTIME- \`${mojangStatus.report.api.uptime}%\``;
    }else{
      apiStatus = `**↳** UPTIME- \`${mojangStatus.report.api.uptime}%\`
      **↳** DOWN- <t:${new Date(mojangStatus.report.api.down_since).getTime()}:R>`;
    }

    let sessionStatus;
    let sessionO = "🔴";

    if(mojangStatus.report.session.status === "up"){
      sessionO = "🟢";
      sessionStatus = `**↳** UPTIME- \`${mojangStatus.report.session.uptime}%\``;
    }else{
      apiStatus = `**↳** UPTIME- \`${mojangStatus.report.session.uptime}%\`
      **↳** DOWN- <t:${new Date(mojangStatus.report.session.down_since).getTime()}:R>`;
    }

    let loginStatus;
    let loginO = "🟢";

    if(mojangStatus.report.login.status === "up"){
      loginO = "🟢";
      loginStatus = `**↳** UPTIME- \`${mojangStatus.report.login.uptime}%\``;
    }else{
      loginStatus = `**↳** UPTIME- \`${mojangStatus.report.login.uptime}%\`
      **↳** DOWN- <t:${new Date(mojangStatus.report.login.down_since).getTime()}:R>`;
    }

    let realmsStatus;
    let realmsO = "🔴";

    if(mojangStatus.report.realms.status === "up"){
      realmsO = "🟢";
      realmsStatus = `**↳** UPTIME- \`${mojangStatus.report.realms.uptime}%\``;
    }else{
      realmsStatus = `**↳** UPTIME- \`${mojangStatus.report.realms.uptime}%\`
      **↳** DOWN- <t:${new Date(mojangStatus.report.realms.down_since).getTime()}:R>`;
    }

    embed.setTitle("Mojang Status")
      .addFields({
        name: `${skinsO} SKINS`,
        value: skinsStatus
      },
      {
        name: `${websiteO} WEBSITE`,
        value: websiteStatus
      },
      {
        name: `${apiO} API`,
        value: apiStatus
      },
      {
        name: `${sessionO} SESSION`,
        value: sessionStatus
      },
      {
        name: `${loginO} LOGIN`,
        value: loginStatus
      },
      {
        name: `${realmsO} REALMS`,
        value: realmsStatus
      })
      .setThumbnail("https://i.ibb.co/71P14DF/mojang-logo.png");

    await interaction.editReply({embeds: [embed]}).catch(async error => {
      await errorLogger(client, interaction, error, "src/commands/mojang.js : 11");
    });
  },
}