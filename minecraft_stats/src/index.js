const { Client, Collection, Intents, MessageEmbed, Permissions } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const path = require('path');
const fs = require('fs');
const chalk = require("chalk");

const config = require('./config/config.json');
const embedConfig = require('./config/embedConfig.json');
const databaseBuilder = require("./builder/databaseBuilder.js");
const messageEmojisReplacer = require("./editor/messageEmojisReplacer.js");
const errorLogger = require("./logger/errorLogger.js");
const logger = require("./logger/logger.js");

const clientID = config.clientID;
const token = config.token;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
  ]
});

client.commands = new Collection();
const commands = [];
let commandsDirectoryLocation = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsDirectoryLocation).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

let eventsDirectoryLocation = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsDirectoryLocation).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  let embed = new MessageEmbed()
    .setColor(embedConfig.defaultColor)

  const event = require(`./events/${file}`);

  try{
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger, ...args));
    }
  }catch (error){
    errorLogger(client, null, error, "src/index.js : 50");
  }
}

const rest = new REST({ version: '9' }).setToken(token);

/*rest.put(Routes.applicationGuildCommands(clientID, "956258527771508766"), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);*/

  const line = "-----------------------------------------------------------------------------------------------------------------------";

rest.put(Routes.applicationCommands(clientID), { body: commands })
  .then(async () => console.log(`${line}\n` + chalk.green('All application commands registered.\n') + line))
  .catch(console.error);

client.login(token);