module.exports = async (client, message, msg) => {
  let t = msg;
  let args = msg.split(" ");
  
  for(let i=1; i<=args.length; i++){
    t = t.replace("\n", " \n ").replace(":\n", ": \n").replace("\n:", "\n :").replace(":\n:", ": \n :");
  }

  args = t.split(/ +/);

  for(let i=0; i<= args.length-1; i++){
    if(args[i].startsWith(':') && args[i].endsWith(':')){
      let text = args[i];
      let emojiName = args[i].slice(1, -1);
      let emoji;

      if(message.guild){
        emoji = await message.guild.emojis.cache.find(emojiIDs => emojiIDs.name == emojiName);
      }

      if(!emoji){
        emoji = await client.emojis.cache.find(emojiIDs => emojiIDs.name == emojiName);
      }

      if(emoji){
        if(emoji.animated){
          args[i] = `<a:${emoji.name}:${emoji.id}>`;
        }else{
          args[i] = `<:${emoji.name}:${emoji.id}>`;
        }    
       }else{
        args[i] = ":" + text + ":";
      }
    }
  }

  t = await args.join(" ");
  
  for(let i=1; i<=args.length; i++){
    t = t.replace(" \n ", "\n").replace(": \n", ":\n").replace("\n :", "\n:").replace(": \n :", ":\n:");
  }
  
  return t; 
}