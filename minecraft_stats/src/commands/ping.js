let { SlashCommandBuilder } = require("@discordjs/builders");

let defaultLogoMC = "https://i.ibb.co/NY6KH17/default-icon.png";
let defaultLogoFivem = "https://i.imgur.com/w4RuVUC.png";
let defaultLogoSAMP = "https://i.imgur.com/eXIEgtR.png";

const javaFetcher = require("../fetcher/javaFetcher.js");
const queryFetcher = require("../fetcher/queryFetcher.js");
const bedrockFetcher = require("../fetcher/bedrockFetcher.js");
const fivemFetcher = require("../fetcher/fivemFetcher.js");
const sampFetcher = require("../fetcher/sampFetcher.js");

const emojisFetcher = require("../fetcher/emojisFetcher.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping a server and show its status.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("java")
        .setDescription("Ping a Minecraft Java server.")
        .addStringOption((option) =>
          option
            .setName("ip")
            .setDescription("Java server IP.")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("java_port").setDescription("Java server port.")
        )
        .addIntegerOption((option) =>
          option.setName("query_port").setDescription("Java server query port.")
        )
        .addIntegerOption((option) =>
          option.setName("bedrock_port").setDescription("Bedrock server port.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bedrock")
        .setDescription("Ping a Minecraft Bedrock server.")
        .addStringOption((option) =>
          option
            .setName("ip")
            .setDescription("Bedrock server IP.")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("bedrock_port").setDescription("Bedrock server port.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("fivem")
        .setDescription("Ping a FiveM server.")
        .addStringOption((option) =>
          option
            .setName("ip")
            .setDescription("FiveM server IP.")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("fivem_port").setDescription("FiveM server port.")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("samp")
        .setDescription("Ping a SA-MP server.")
        .addStringOption((option) =>
          option
            .setName("ip")
            .setDescription("SA-MP server IP.")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("samp_port").setDescription("SA-MP server port.")
        )
    ),

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
    const settings = emojis.settings;
    const users = emojis.users;
    const pen = emojis.pen;
    const signal = emojis.signal;
    const fiveM = emojis.fiveM;
    const SAMP = emojis.samp;

    embed = new MessageEmbed().setColor(embedConfig.defaultColor);

    const subCommand = await await interaction.options.getSubcommand();
    let IP = await interaction.options.getString("ip");

    if (IP.includes(":")) {
      IP = IP.split(":")[0];
    }

    if (subCommand === "java") {
      let javaPort =
        (await interaction.options.getInteger("java_port")) || 25565;
      let bedrockPort =
        (await interaction.options.getInteger("bedrock_port")) || null;

      if (javaPort < 1 || javaPort > 65535) {
        embed
          .setDescription(
            `${cross} Port cannot be less than 1 or greater than 65535.`
          )
          .setDescription(embedConfig.errorColor);

        return;
      }

      if (bedrockPort < 1) {
        bedrockPort = null;
      }

      try {
        let rawData = await javaFetcher(client, interaction.id, IP, javaPort);

        if (rawData) {
          if (rawData[0] === "ONLINE") {
            let motd = rawData[1];
            let version = rawData[2];
            let online = rawData[3];
            let max = rawData[4];

            let sampleList = rawData[5];

            let favicon = rawData[6] || defaultLogoMC;
            let roundTripLatency = rawData[7];

            let playersList;

            let queryPort = await interaction.options.getInteger("query_port");

            if (queryPort < 1) {
              queryPort = null;
            }

            if (queryPort) {
              let rawData2 = ["OFFLINE"];

              try {
                rawData2 = await queryFetcher(IP, queryPort);

                if (rawData2[0] === "ONLINE") {
                  playersList = rawData2[1];
                }
              } catch {}
            }

            if (bedrockPort) {
              let rawData3 = ["OFFLINE"];

              try {
                rawData3 = await bedrockFetcher(IP, bedrockPort);

                if (rawData3[0] === "ONLINE") {
                  javaPort = `JAVA- ${javaPort}\nBEDROCK- ${bedrockPort}`;
                }
              } catch {}
            }

            embed = new MessageEmbed()
              .addFields(
                {
                  name: `${grass} SERVER`,
                  value: `\`\`\`fix\nMinecraft\n\`\`\``,
                },
                {
                  name: `${grass} EDITION`,
                  value: `\`\`\`fix\nJAVA\n\`\`\``,
                },
                {
                  name: `${wifi} IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``,
                },
                {
                  name: `${wifi} PORT`,
                  value: `\`\`\`fix\n${javaPort}\n\`\`\``,
                },
                {
                  name: `${settings} VERSION`,
                  value: `\`\`\`fix\n${version}\n\`\`\``,
                },
                {
                  name: `${users} PLAYING`,
                  value: `\`\`\`fix\n${online}/${max}\n\`\`\``,
                },
                {
                  name: `${pen} MOTD`,
                  value: `\`\`\`fix\n${motd}\n\`\`\``,
                },
                {
                  name: `${signal} LATENCY`,
                  value: `\`\`\`fix\n${roundTripLatency}ms\n\`\`\``,
                }
              )
              .setColor(embedConfig.successColor)
              .setThumbnail(favicon);

            if (playersList && playersList.length > 0) {
              await embed.addField(
                `${users} PLAYERS`,
                `\`\`\`fix\n${playersList}\n\`\`\``
              );
            } else if (sampleList && sampleList.length > 0) {
              await embed.addField(
                `${users} PLAYERS`,
                `\`\`\`fix\n${sampleList}\n\`\`\``
              );
            }
          } else if (rawData[0] === "OFFLINE") {
            if (bedrockPort) {
              javaPort = `JAVA- ${javaPort}\nBEDROCK/PE- ${bedrockPort}`;
            }

            await embed
              .setTitle("OFFLINE")
              .addFields(
                {
                  name: `${grass} SERVER`,
                  value: `\`\`\`fix\nMinecraft\n\`\`\``,
                },
                {
                  name: `${grass} EDITION`,
                  value: `\`\`\`fix\nJAVA\n\`\`\``,
                },
                {
                  name: `${wifi} IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``,
                },
                {
                  name: `${wifi} PORT`,
                  value: `\`\`\`fix\n${javaPort}\n\`\`\``,
                }
              )
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogoMC);
          } else {
            embed = new MessageEmbed()
              .setDescription(`${cross} Error showing server stats.`)
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogoMC);
          }
        } else {
          embed = new MessageEmbed()
            .setDescription(
              `${cross} Unable to fetch the data. Please check if the **\`IP\`** and **\`PORT\`** are correct.\nAlso check if the server is online.`
            )
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogoMC);
        }
      } catch (error) {
        embed = new MessageEmbed()
          .setDescription(
            `${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``
          )
          .setColor(embedConfig.errorColor)
          .setThumbnail(defaultLogoMC);
      }
    } else if (subCommand === "bedrock") {
      let bedrockPort =
        (await interaction.options.getInteger("bedrock_port")) || 19132;

      if (bedrockPort < 1 || bedrockPort > 65535) {
        embed
          .setDescription(
            `${cross} Port cannot be less than 1 or greater than 65535.`
          )
          .setDescription(embedConfig.errorColor);

        return;
      }

      try {
        let rawData = await bedrockFetcher(IP, bedrockPort);

        if (rawData) {
          if (rawData[0] === "ONLINE") {
            let edition = rawData[1];
            let motd = rawData[2];
            let version = rawData[3];
            let online = rawData[4];
            let max = rawData[5];
            let portIPv4 = rawData[6];
            let portIPv6 = rawData[7];

            if (portIPv4 !== "NULL" || portIPv6 !== "NULL") {
              bedrockPort = `DEFAULT- ${bedrockPort}`;

              if (portIPv4 !== "NULL") {
                bedrockPort = bedrockPort + `\nIPv4- ${portIPv4}`;
              }

              if (portIPv6 !== "NULL") {
                bedrockPort = bedrockPort + `\nIPv6- ${portIPv6}`;
              }
            }

            embed = new MessageEmbed()
              .addFields(
                {
                  name: `${grass} SERVER`,
                  value: `\`\`\`fix\nMinecraft\n\`\`\``,
                },
                {
                  name: `${grass} EDITION`,
                  value: `\`\`\`fix\n${edition}\n\`\`\``,
                },
                {
                  name: `${wifi} IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``,
                },
                {
                  name: `${wifi} PORT`,
                  value: `\`\`\`fix\n${bedrockPort}\n\`\`\``,
                },
                {
                  name: `${settings} VERSION`,
                  value: `\`\`\`fix\n${version}\n\`\`\``,
                },
                {
                  name: `${users} PLAYING`,
                  value: `\`\`\`fix\n${online}/${max}\n\`\`\``,
                },
                {
                  name: `${pen} MOTD`,
                  value: `\`\`\`fix\n${motd}\n\`\`\``,
                }
              )
              .setColor(embedConfig.successColor);
          } else if (rawData[0] === "OFFLINE") {
            await embed
              .setTitle("OFFLINE")
              .addFields(
                {
                  name: `${grass} SERVER`,
                  value: `\`\`\`fix\nMinecraft\n\`\`\``,
                },
                {
                  name: `${grass} EDITION`,
                  value: `\`\`\`fix\nBEDROCK\n\`\`\``,
                },
                {
                  name: `${wifi} IP`,
                  value: `\`\`\`fix\n${IP}\n\`\`\``,
                },
                {
                  name: `${wifi} PORT(IPv4)`,
                  value: `\`\`\`fix\n${portIPv4}\n\`\`\``,
                }
              )
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogoMC);
          } else {
            embed = new MessageEmbed()
              .setDescription(`${cross} Error showing server stats.`)
              .setColor(embedConfig.errorColor)
              .setThumbnail(defaultLogoMC);
          }
        } else {
          embed = new MessageEmbed()
            .setDescription(
              `${cross} Unable to fetch the data. Please check if the **\`IP\`** and **\`PORT\`** are correct.\nAlso check if the server is online.`
            )
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogoMC);
        }
      } catch (error) {
        embed = new MessageEmbed()
          .setDescription(
            `${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``
          )
          .setColor(embedConfig.errorColor)
          .setThumbnail(defaultLogoMC);
      }
    } else if (subCommand === "fivem") {
      let fivemPort =
        (await interaction.options.getInteger("fivem_port")) || 30120;

      if (fivemPort < 1 || fivemPort > 65535) {
        embed
          .setDescription(
            `${cross} Port cannot be less than 1 or greater than 65535.`
          )
          .setDescription(embedConfig.errorColor);

        return;
      }

      try {
        let rawData = await fivemFetcher(
          client,
          interaction.guild.id,
          IP,
          fivemPort
        );

        if (rawData[0] === "ONLINE") {
          let favicon = rawData[1] || defaultLogoFivem;
          let banner = rawData[2];
          let language = rawData[3];
          let max = rawData[4];
          let motd = rawData[5];
          let serverName = rawData[6];
          let tags = rawData[7];
          let online = rawData[8];
          let playersList = rawData[9];

          embed = new MessageEmbed()
            .addFields(
              {
                name: `${fiveM} SERVER`,
                value: `\`\`\`fix\nFiveM\n\`\`\``,
              },
              {
                name: `${fiveM} NAME`,
                value: `\`\`\`fix\n${serverName}\n\`\`\``,
              },
              {
                name: `${wifi} IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``,
              },
              {
                name: `${wifi} PORT`,
                value: `\`\`\`fix\n${fivemPort}\n\`\`\``,
              },
              {
                name: `${users} LANGUAGE`,
                value: `\`\`\`fix\n${language}\n\`\`\``,
              },
              {
                name: `${users} PLAYING`,
                value: `\`\`\`fix\n${online}/${max}\n\`\`\``,
              },
              {
                name: `${pen} DESCRIPTION`,
                value: `\`\`\`fix\n${motd}\n\`\`\``,
              },
              {
                name: `${pen} TAGS`,
                value: `\`\`\`fix\n${tags}\n\`\`\``,
              }
            )
            .setColor(embedConfig.successColor)
            .setThumbnail(favicon);

          if (playersList) {
            await embed.addField(
              `${users} PLAYERS`,
              `\`\`\`fix\n${playersList}\n\`\`\``
            );
          }

          if (banner) {
            embed.setImage(banner);
          }
        } else {
          embed = new MessageEmbed()
            .setTitle("OFFLINE")
            .addFields(
              {
                name: `${fiveM} SERVER`,
                value: `\`\`\`fix\nFiveM\n\`\`\``,
              },
              {
                name: `${wifi} IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``,
              },
              {
                name: `${wifi} PORT`,
                value: `\`\`\`fix\n${fivemPort}\n\`\`\``,
              }
            )
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogoFivem);
        }
      } catch (error) {
        embed = new MessageEmbed()
          .setDescription(
            `${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``
          )
          .setColor(embedConfig.errorColor)
          .setThumbnail(defaultLogoFivem);
      }
    } else if (subCommand === "samp") {
      let sampPort =
        (await interaction.options.getInteger("samp_port")) || 7777;

      if (sampPort < 1 || sampPort > 65535) {
        embed
          .setDescription(
            `${cross} Port cannot be less than 1 or greater than 65535.`
          )
          .setDescription(embedConfig.errorColor);

        return;
      }

      try {
        let rawData = await sampFetcher(IP, sampPort);

        if (rawData[0] === "ONLINE") {
          let serverName = rawData[1];
          let gameMode = rawData[2];
          let map = rawData[3];
          let passworded = rawData[4];
          let max = rawData[5];
          let online = rawData[6];
          let playersList = rawData[7];

          embed = new MessageEmbed()
            .addFields(
              {
                name: `${SAMP} SERVER`,
                value: `\`\`\`fix\nSA-MP\n\`\`\``,
              },
              {
                name: `${wifi} IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``,
              },
              {
                name: `${wifi} PORT`,
                value: `\`\`\`fix\n${sampPort}\n\`\`\``,
              },
              {
                name: `${SAMP} NAME`,
                value: `\`\`\`fix\n${serverName}\n\`\`\``,
              },
              {
                name: `${users} GAMEMODE`,
                value: `\`\`\`fix\n${gameMode}\n\`\`\``,
              },
              {
                name: `${users} PLAYING`,
                value: `\`\`\`fix\n${online}/${max}\n\`\`\``,
              },
              {
                name: `${pen} MAP`,
                value: `\`\`\`fix\n${map}\n\`\`\``,
              },
              {
                name: `${pen} PASSWORD?`,
                value: `\`\`\`fix\n${passworded}\n\`\`\``,
              }
            )
            .setColor(embedConfig.successColor)
            .setThumbnail(defaultLogoSAMP);

          if (playersList) {
            await embed.addField(
              `${users} PLAYERS`,
              `\`\`\`fix\n${playersList}\n\`\`\``
            );
          }
        } else {
          embed = new MessageEmbed()
            .setTitle("OFFLINE")
            .addFields(
              {
                name: `${SAMP} SERVER`,
                value: `\`\`\`fix\nSA-MP\n\`\`\``,
              },
              {
                name: `${wifi} IP`,
                value: `\`\`\`fix\n${IP}\n\`\`\``,
              },
              {
                name: `${wifi} PORT`,
                value: `\`\`\`fix\n${sampPort}\n\`\`\``,
              }
            )
            .setColor(embedConfig.errorColor)
            .setThumbnail(defaultLogoSAMP);
        }
      } catch (error) {
        embed = new MessageEmbed()
          .setDescription(
            `${cross} **Error Fetching server stats**-\n\`\`\`${error}\`\`\``
          )
          .setColor(embedConfig.errorColor)
          .setThumbnail(defaultLogoFivem);
      }
    } else {
      await embed
        .setDescription(`${cross} Server IP, port not set.`)
        .setColor(embedConfig.errorColor);

      await interaction.editReply({ embeds: [embed] }).catch(async (error) => {
        await errorLogger(
          client,
          interaction,
          error,
          "src/commands/ping.js : 492"
        );
      });

      return;
    }

    await interaction.editReply({ embeds: [embed] }).catch(async (error) => {
      await errorLogger(
        client,
        interaction,
        error,
        "src/commands/ping.js : 499"
      );
    });
  },
};
