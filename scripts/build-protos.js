const config = require("../build.config.json");
const fs = require("fs");
var fsx = require('fs.extra');
const execFile = require('child_process').execFile;
var exec = require('child_process').exec;

config.projects.forEach(project => {
	if (!project.disabled) {
		if (project.protoOutputs) {
			project.protoOutputs.forEach(output => {
				if (!fs.existsSync(output.path)) {
					fs.mkdirSync(output.path);
				}
				var servicePath = "protos/" + project.service;
				switch (output.lang) {
					case "go":
						exec(`protoc --proto_path=${servicePath} --go_out=plugins=grpc:${output["path"]} ${servicePath}/*.proto`,
							(error, stdout, strerr) => {
								console.log(strerr);
							});
						break;
					case "node":
						fs.readdir(`./protos/${project["service"]}`, (err, files) => {
							files.forEach(file => {
								if (file.endsWith(".proto")) {
									exec(`grpc_tools_node_protoc --proto_path=${servicePath} --js_out=import_style=commonjs,binary:${output.path} --grpc_out=${output.path} --plugin=grpc_tools_node_protoc_plugin ${servicePath}/${file}`,
										(error, stdout, strerr) => {
											console.log(strerr);
										});
								}
							});
						});
						break;
					case "move":
						if (fs.existsSync(output.path)) {
							fsx.rmrfSync(output.path);
						} else {
							fs.mkdirSync(output.path);
						}
						fsx.copyRecursive(`./protos/${project["service"]}`, output.path, (err) => {
							if (err) {
								console.log("err", err);
							}
						});
						break;
				}
			});
		}
	}
});