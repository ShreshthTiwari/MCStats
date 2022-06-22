module.exports = {
  name: 'error',
  async execute(client, embed, MessageEmbed, config, embedConfig, databaseBuilder, Permissions, messageEmojisReplacer, errorLogger, logger, error) {
    try{
        await errorLogger(client, null, error, "src/events/error.js : 5");
    }catch(error){
      console.log(error);
    }
  },
};