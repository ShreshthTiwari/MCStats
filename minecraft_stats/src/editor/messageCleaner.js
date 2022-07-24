module.exports = async (data) => {
  data = data + "";
  data = data.toLowerCase();
  let rawData = data.split("");
  let finalData = [];
  let index = 0;

  if (rawData) {
    for (let i = 0; i <= rawData.length - 1; i++) {
      let d = rawData[i + 1] + "";

      if (
        (rawData[i] === "§" || rawData[i] === "&") &&
        ("0" <= d <= "9" || "a" <= d <= "z")
      ) {
        i++;
      } else {
        finalData[index++] = rawData[i];
      }
    }

    return finalData.join("");
  } else {
    return data;
  }
};
