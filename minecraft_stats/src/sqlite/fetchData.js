const buildDB = require("../sqlite/buildDB.js");
const db = buildDB();

module.exports = async (query, type) => {
  let result;

  if (!type) {
    type = "all";
  }

  try {
    if (query) {
      if (type === "all") {
        await new Promise(async (resolve) => {
          db.serialize(async () => {
            db.all(query, async function (error, rows) {
              if (error) {
                result = null;
                resolve(error);
              } else {
                result = rows;
                resolve(rows);
              }
            });
          });
        });
      } else if (type === "each") {
        await new Promise(async (resolve) => {
          db.serialize(async () => {
            db.each(query, async function (error, row) {
              if (error) {
                result = null;
                resolve(error);
              } else {
                result = row;
                resolve(row);
              }
            });
          });
        });
      } else {
        result = null;
      }
    } else {
      result = null;
    }
  } catch (error) {
    result = null;
  }

  return result;
};
