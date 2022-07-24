let { SlashCommandBuilder } = require("@discordjs/builders");

const emojisFetcher = require("../fetcher/emojisFetcher.js");

const buildDB = require("../sqlite/buildDB.js");
const db = buildDB();

let defaultLogoMC = "https://i.ibb.co/NY6KH17/default-icon.png";
let defaultLogoFivem = "https://i.imgur.com/w4RuVUC.png";
let defaultLogoSAMP = "https://i.imgur.com/eXIEgtR.png";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ip")
    .setDescription("Show ip and port of the minecraft server."),

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

    const grass = emojis.grass;
    const wifi = emojis.wifi;
    const fiveM = emojis.fiveM;
    const SAMP = emojis.samp;

    embed = new MessageEmbed().setColor(embedConfig.defaultColor);

    db.serialize(async () => {
      db.each(
        `SELECT * FROM GLOBAL WHERE guild_id like "${interaction.guild.id}"`,
        async (error, row) => {
          if (error) {
            await errorLogger(
              client,
              interaction,
              error,
              "src/commands/ip.js : 31"
            );
          } else {
            let IP = row.ip;
            let javaPort = row.java_port * 1 <= 0 ? null : row.java_port * 1;
            let bedrockPort =
              row.bedrock_port * 1 <= 0 ? null : row.bedrock_port * 1;
            let fivemPort = row.fivem_port * 1 <= 0 ? null : row.fivem_port * 1;
            let sampPort = row.samp_port * 1 <= 0 ? null : row.samp_port * 1;
            let hiddenPorts = row.hidden_ports === "true" ? true : false;

            if (!IP) {
              await embed
                .setDescription(`${cross} Server IP not set.`)
                .setColor(embedConfig.errorColor);

              await interaction
                .editReply({ embeds: [embed] })
                .catch(async (error) => {
                  await errorLogger(
                    client,
                    interaction,
                    error,
                    "src/commands/ip.js : 45"
                  );
                });

              return;
            }

            let port;
            let edition;
            let server;
            let emoji;

            if (javaPort && bedrockPort) {
              edition = "JAVA";
              port = `JAVA- ${javaPort}\nBEDROCK/PE- ${bedrockPort}`;
              server = "Minecraft";
              emoji = grass;
              logo = defaultLogoMC;
            } else if (javaPort) {
              edition = "JAVA";
              port = javaPort;
              server = "Minecraft";
              emoji = grass;
              logo = defaultLogoMC;
            } else if (bedrockPort) {
              edition = "BEDROCK";
              port = bedrockPort;
              server = "Minecraft";
              emoji = grass;
              logo = defaultLogoMC;
            } else if (fivemPort) {
              server = "FiveM";
              port = fivemPort;
              emoji = fiveM;
              logo = defaultLogoFivem;
            } else if (fivemPort) {
              server = "FiveM";
              port = fivemPort;
              emoji = fiveM;
              logo = defaultLogoFivem;
            } else if (sampPort) {
              server = "SA-MP";
              port = sampPort;
              emoji = SAMP;
              logo = defaultLogoSAMP;
            } else {
              await embed
                .setDescription(`${cross} Server PORT not set.`)
                .setColor(embedConfig.errorColor);

              await interaction
                .editReply({ embeds: [embed] })
                .catch(async (error) => {
                  await errorLogger(
                    client,
                    interaction,
                    error,
                    "src/commands/ip.js : 94"
                  );
                });

              return;
            }

            embed = new MessageEmbed()
              .addField(`${emoji} SERVER`, `\`\`\`fix\n${server}\n\`\`\``)
              .setThumbnail(logo);

            if (edition) {
              embed.addField(
                `${emoji} EDITION`,
                `\`\`\`fix\n${edition}\n\`\`\``
              );
            }

            embed
              .addField(`${wifi} IP`, `\`\`\`fix\n${IP}\n\`\`\``)
              .setColor(embedConfig.defaultColor);

            if (!hiddenPorts) {
              embed.addField(`${wifi} PORT`, `\`\`\`fix\n${port}\n\`\`\``);
            }

            await interaction
              .editReply({ embeds: [embed] })
              .catch(async (error) => {
                await errorLogger(
                  client,
                  interaction,
                  error,
                  "src/commands/ip.js : 116"
                );
              });
          }
        }
      );
    });
  },
};
