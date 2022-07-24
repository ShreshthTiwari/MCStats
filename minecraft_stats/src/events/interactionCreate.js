const runQuery = require("../sqlite/runQuery.js");

const commandUsed = new Set();

module.exports = {
  name: "interactionCreate",
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
    interaction
  ) {
    if (interaction.user.bot || !interaction.guild) {
      return;
    }

    const commandsCooldown = config.commandsCooldown;

    await runQuery(
      `INSERT OR IGNORE INTO GLOBAL (guild_id) VALUES ("${interaction.guild.id}")`
    );

    embed = new MessageEmbed().setColor(embedConfig.defaultColor);

    if (!interaction.isCommand()) return;

    let commandName = interaction.commandName;

    const command = client.commands.get(commandName);

    if (!command) return;

    await interaction.deferReply({ ephemeral: true });

    const tick = "✅";
    const cross = "❌";

    try {
      if (
        !(
          commandName === "invite" ||
          commandName === "bot" ||
          commandName === "support" ||
          commandName === "status" ||
          commandName === "ping" ||
          commandName === "vote" ||
          commandName === "ip" ||
          commandName === "help"
        )
      ) {
        try {
          if (interaction.member) {
            let owner = await interaction.guild.fetchOwner();

            if (owner && interaction.member.id !== owner.id) {
              if (interaction.member.permissions) {
                if (
                  !interaction.member.permissions.has(
                    Permissions.FLAGS.ADMINISTRATOR
                  ) &&
                  interaction.user.id !== config.authorID
                ) {
                  embed
                    .setDescription(
                      `${cross} Missing Permission- \`ADMINISTRATOR\`.`
                    )
                    .setColor(embedConfig.errorColor);

                  await interaction
                    .editReply({ embeds: [embed] })
                    .catch(async (error) => {
                      await errorLogger(
                        client,
                        interaction,
                        error,
                        "src/commands/interactionCreate.js : 45"
                      );
                    });

                  return;
                }
              }
            }
          }
        } catch {}
      }

      if (commandUsed.has(interaction.user.id)) {
        embed
          .setDescription(
            `${cross} Please wait for 3 seconds before using the command.`
          )
          .setColor(embedConfig.errorColor);

        await interaction
          .editReply({ embeds: [embed] })
          .catch(async (error) => {
            await errorLogger(
              client,
              interaction,
              error,
              "src/commands/interactionCreate.js : 61"
            );
          });

        return;
      } else {
        await command.execute(
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
        );

        commandUsed.add(interaction.user.id);

        setTimeout(() => {
          commandUsed.delete(interaction.user.id);
        }, commandsCooldown * 1000);
      }
    } catch (error) {
      embed
        .setDescription(
          `${cross} Error while executing this command.\n\`\`\`\n${error}\n\`\`\``
        )
        .setColor(embedConfig.errorColor);

      await interaction.editReply({ embeds: [embed] }).catch(async (error) => {
        await errorLogger(
          client,
          interaction,
          error,
          "src/commands/interactionCreate.js : 79"
        );
      });
    }
  },
};
