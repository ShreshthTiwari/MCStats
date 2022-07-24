const mcdata = require("mcdata");

module.exports = async (name) => {
  try {
    let status = await mcdata.playerStatus(name, { renderSize: 512 });

    return status;
  } catch (error) {
    console.log(error);
  }
};
