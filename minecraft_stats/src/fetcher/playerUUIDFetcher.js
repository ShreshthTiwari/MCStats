const mcdata = require("mcdata");

module.exports = async (name) => {
  let uuid = await mcdata.player.getUUID(name);

  return uuid;
}