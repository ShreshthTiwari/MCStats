const Keyv = require("keyv");

const errorLogger = require("../logger/errorLogger.js");

module.exports = async (client, interaction) => {
  let err = false;

  let database;

  let Table = "";

  if(interaction === "global"){
    Table = "global";
  }else{
    try{
      Table = interaction.guild.id;
    }catch{
      try{
        Table = interaction.id;
      }catch(error){
        errorLogger(client, interaction, "Table name is null", "src/builder/databaseBuilder.js : 21");
        console.log(error);
        
        return;
      }
    }
  }
  

  if(!Table){
    errorLogger(client, interaction, "Table name is null", "src/builder/databaseBuilder.js : 30");
    
    return;
  }

  if(!(Table.startsWith("_"))){
    Table = "_" + Table
  }

  do{
    err = false;

    database = new Keyv('sqlite://./minecraft_stats/src/database/database.sqlite', {
      table: Table
    });
  
    database.on('error', async error =>{
      err = true;
  
      errorLogger(client, interaction, error, "src/builder/databaseBuilder.js : 49");
    }); 
  }while(err === true);
  
  if(!err){
    return database;
  }

  return null;
}