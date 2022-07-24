const mcdata = require("mcdata");

module.exports = async (uuid) => {
  try {
    let history = await mcdata.player.getNameHistory(uuid);

    return history;
  } catch (error) {
    console.log(error);
  }
};
