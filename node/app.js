const getDerfinitions = require("./getDefinitions");
const writeTsIndex = require("./writeTsIndex");
const writeJsIndex = require("./writeJsIndex");

const d = getDerfinitions("./protos/risto/risto_service.proto");
writeTsIndex(d);
writeJsIndex(d);

console.log("d", d);
