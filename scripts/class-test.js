
console.log("pluu pluu");

const ClassGenerator = require("./ClassGenerator");

var matrixGenerator = new ClassGenerator({
	name: "Matrix"
});

matrixGenerator.addProperty("id");
matrixGenerator.addProperty("ip", () => {
	console.log("hermaani");
});
console.log(matrixGenerator.properties.map(p => p.fn));
matrixGenerator.addProperty("port");
matrixGenerator.addProperty("numberOfConPorts");
matrixGenerator.addProperty("numberOfCpuPorts");

matrixGenerator.render();

