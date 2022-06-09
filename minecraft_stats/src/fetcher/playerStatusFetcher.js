const mcdata = require("mcdata");

module.exports = async (name) => {
  let status = await mcdata.playerStatus(name, { renderSize: 512 });

  return status;
}