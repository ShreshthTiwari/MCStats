const mcdata = require("mcdata");

module.exports = async (uuid) => {
  let name = await mcdata.player.getUsername(uuid);

  return name;
}