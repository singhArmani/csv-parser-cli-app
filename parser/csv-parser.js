const fs = require("fs");
function csvParser(path, separator = ",") {
  const data = fs.readFileSync(path, "utf8");
  return data.split(/\r?\n/).map((r) => r.split(","));
}

module.exports = csvParser;
