const path = require("path");
const fs = require("fs");
const execSync = require("child_process").execSync;

let inputDirPath = "";
let outputDirPath = "";
let serviceFileName = "";

process.argv.forEach((v, i) => {
	switch (v) {
		case "-i":
			inputDirPath = process.argv[i + 1];
			break;
		case "-o":
			outputDirPath = process.argv[i + 1];
			break;
		case "--serviceFileName":
			serviceFileName = process.argv[i + 1];
			break;
	}
});

if (!inputDirPath) {
	throw new Error("No inputDirPath with -i specified");
}

if (!outputDirPath) {
	throw new Error("No outputDirPath with -o specified");
}

if (!serviceFileName) {
	throw new Error("No serviceFilenName with --serviceFileName specified");
}

if (!fs.existsSync(outputDirPath)) {
	fs.mkdirSync(outputDirPath);
}

fs.readdirSync(outputDirPath).forEach(fileName => {
	fs.unlinkSync(path.join(outputDirPath, fileName));
});

stdout = execSync(
	`docker run -v ${path.resolve(
		inputDirPath
	)}:/usr/src/protos -v ${path.resolve(
		outputDirPath
	)}:/usr/src/output -e SERVICE_FILE_NAME=${serviceFileName} jaska/node-grpc-build`
);

console.log("stdout", String(stdout));
