module.exports = async (client, message, msg) => {
  try{
    msg = await msg.join(" ");
  }catch{}

  try{
    msg += '';
    let args = await msg.split(" ");
  
    for(let i=0; i<=args.length-1; i++){
      if(/:[^:\s]*(?:::[^:\s]*)*:/.test(args[i])){
        args[i] += "";
        let tempArgs = [];
  
        while(args[i].includes("::")){
          args[i] = await args[i].replace("::", ": :");
        }
  
        tempArgs = await args[i].split(" ");
  
        for(let j=0; j<=tempArgs.length-1; j++){
          if(tempArgs[j].length >= 3 && tempArgs[j].startsWith(":") && tempArgs[j].endsWith(":")){
            let emojiName = await tempArgs[j].slice(1, -1);
            let emoji = await message.guild.emojis.cache.find(e => e.name === emojiName) || await client.emojis.cache.find(e => e.name === emojiName);
  
            if(emoji){
              tempArgs[j] = emoji;
            }
          }
        }
  
        args[i] = await tempArgs.join(" ");
  
        while(args[i].includes(": :")){
          args[i] = await args[i].replace(": :", "::");
        }

        while(args[i].includes(" ")){
          args[i] = await args[i].replace(" ", "");
        }
      }
    }

    let editedMessage = await args.join(" ");

    return editedMessage;
  }catch(error){
    console.log(error);
  }
}