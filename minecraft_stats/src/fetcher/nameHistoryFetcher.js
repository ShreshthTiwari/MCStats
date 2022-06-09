const mcdata = require("mcdata");

module.exports = async (uuid) => {
  let history = await mcdata.player.getNameHistory(uuid);

  return history;
}