let util = require("minecraft-server-util");

const messageCleaner = require("../editor/messageCleaner.js");

module.exports = async (IP, port) => {
  let rawData = ["OFFLINE"];

  try {
    rawData = await util
      .statusBedrock(IP, port * 1, { timeout: 5000 })
      .then((result) => {
        if (result.version.name) {
          return [
            "ONLINE",
            result.edition,
            result.motd.clean,
            result.version.name,
            result.players.online,
            result.players.max,
            result.portIPv4,
            result.portIPv6,
          ];
        } else {
          return ["OFFLINE"];
        }
      })
      .catch(() => {});

    if (rawData[0] === "ONLINE") {
      rawData[1] = (await messageCleaner(rawData[1])) || "NULL";
      rawData[2] = (await messageCleaner(rawData[2])) || "NULL";

      while (rawData[2].includes("  ")) {
        rawData[2] = rawData[2].replace("  ", " ");
      }

      if (rawData[2].startsWith(" ")) {
        rawData[2] = rawData[2].slice(1);
      }

      if (rawData[2].endsWith(" ")) {
        rawData[2] = rawData[2].slice(0, -1);
      }

      rawData[3] = (await messageCleaner(rawData[3])) || "NULL";
      rawData[4] = rawData[4] * 1 || 0;
      rawData[5] = rawData[5] * 1 || 0;
      rawData[6] = rawData[6] || "NULL";
      rawData[7] = rawData[7] || "NULL";

      if (rawData[6] == "-1") {
        rawData[6] = "NULL";
      }

      if (rawData[7] == "-1") {
        rawData[7] = "NULL";
      }
    } else {
      rawData = ["OFFLINE"];
    }
  } catch {
    rawData = ["OFFLINE"];
  }

  return rawData;
};
