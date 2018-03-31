const path = require("path");
const fs = require("fs");
const os = require("os");
const execSync = require("child_process").execSync;

const projectConfigurationsPath = path.join(__dirname, "../go");
const protosDirPath = path.join(__dirname, "../protos");
const goBasePath = process.env.GOPATH || path.join(os.homedir(), "go");

let buildProjects = [];

process.argv.forEach((v, i) => {
	switch (v) {
		case "--projectName":
			const projectName = process.argv[i + 1];
			if (
				!fs.existsSync(
					path.join(projectConfigurationsPath, projectName)
				)
			) {
				console.warn(`Project config ${projectName} not found`);
				break;
			}
			buildProjects.push(projectName);
			break;
	}
});

if (buildProjects.length === 0) {
	console.log(
		"Not --projectName inserted scanning build directory manually."
	);
	buildProjects = fs.readdirSync(projectConfigurationsPath);
}

if (buildProjects.length === 0) {
	console.log("No build configurations found exiting now");
	process.exit(0);
}

console.log("gopath", process.env.GOPATH);
console.log("goroot", process.env.GOROOT);
console.log("go base path", goBasePath);

buildProjects.forEach(projectName => {
	const projectProtosDirPath = path.join(
		protosDirPath,
		projectName.split(".")[0]
	);
	console.log("projectProtosDirPath", projectProtosDirPath);
	const config = require(path.join(projectConfigurationsPath, projectName));
	console.log("config", config);
	console.log("lib path", path.join(goBasePath, "src", config.outputPath));
	const buildCommand = `docker run -v ${path.resolve(
		projectProtosDirPath
	)}:/usr/src/protos -v ${path.resolve(
		path.join(goBasePath, "src", config.outputPath)
	)}:/usr/src/output jaska/go-grpc-build`;
	console.log("build command", buildCommand);
	execSync(buildCommand);
});
