const mcdata = require("mcdata");

module.exports = async () => {
  let status = await mcdata.mojangStatus();

  return status;
}