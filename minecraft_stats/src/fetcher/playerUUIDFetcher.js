const mcdata = require("mcdata");

module.exports = async (name) => {
  try {
    let uuid = await mcdata.player.getUUID(name);

    return uuid;
  } catch (error) {
    console.log(error);
  }
};
