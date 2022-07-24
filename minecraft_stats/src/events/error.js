module.exports = {
  name: 'error',
  async execute(client, embed, MessageEmbed, config, embedConfig, Permissions, messageEmojisReplacer, errorLogger, logger, error) {
    try{
      await errorLogger(client, null, error, "src/events/error.js : 5");
    }catch(error){
      await errorLogger(client, null, error, "src/events/error.js : 7");
    }
  },
};