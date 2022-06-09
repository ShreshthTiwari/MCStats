module.exports = async (data) => {
  data = data + '';
  let rawData = data.split("");
  let finalData = [];
  let index = 0;
  
  if(rawData){
    for(let i=0; i<=rawData.length-1; i++){
      let d = rawData[i+1] + '';

      if('A' <= d <= 'Z'){
        d = d.toLowerCase();
      }

      if((rawData[i] === '§' || rawData[i] === '&') && ('0' <= d <= '9' || 'a' <= d <= 'z' || 'A' <= d < 'Z')){
        i++;
      }else{
        finalData[index] = rawData[i];
        index++;
      }
    }

    return finalData.join("");
  }else{
    return data;
  }
}