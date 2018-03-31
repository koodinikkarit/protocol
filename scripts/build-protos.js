const config = require("../build.config.json");
const fs = require("fs");
var fsx = require("fs.extra");
const execFile = require("child_process").execFile;
var exec = require("child_process").exec;
const execSync = require("child_process").execSync;
const path = require("path");

config.projects.forEach(project => {
	if (!project.disabled) {
		if (project.protoOutputs) {
			project.protoOutputs.forEach(output => {
				if (!fs.existsSync(output.path)) {
					fs.mkdirSync(output.path);
				}
				var servicePath = path.join(
					__dirname,
					"../",
					"protos/",
					project.service
				);
				switch (output.lang) {
					case "go":
						const cmd = `protoc --proto_path=${servicePath} --go_out=plugins=grpc:${
							output["path"]
						} ${path.join(servicePath, "/*.proto")}`;
						console.log("cmd is", cmd);
						execSync(cmd);
						break;
					case "node":
						fs.readdir(
							`./protos/${project["service"]}`,
							(err, files) => {
								files.forEach(file => {
									if (file.endsWith(".proto")) {
										execSync(
											`grpc_tools_node_protoc --proto_path=${servicePath} --js_out=import_style=commonjs,binary:${
												output.path
											} --grpc_out=${
												output.path
											} --plugin=grpc_tools_node_protoc_plugin ${servicePath}/${file}`
										);
									}
								});
							}
						);
						break;
					case "move":
						if (fs.existsSync(output.path)) {
							fsx.rmrfSync(output.path);
						} else {
							fs.mkdirSync(output.path);
						}
						fsx.copyRecursive(
							`./protos/${project["service"]}`,
							output.path,
							err => {
								if (err) {
									console.log("err", err);
								}
							}
						);
						break;
				}
			});
		}
	}
});
