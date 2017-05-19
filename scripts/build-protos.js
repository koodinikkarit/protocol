const config = require("../protos/proto.config.json");
const fs = require("fs");
const execFile = require('child_process').execFile;
var exec = require('child_process').exec;

config.projects.forEach(project => {
	project.outputs.forEach(output => {
		if (!fs.existsSync(output.path)) {
			fs.mkdirSync(output.path);
		}

		switch(output.lang) {
			case "go":
				exec(`protoc --proto_path=${project["service"]} --go_out=plugins=grpc:${output["path"]} ${project["service"]} /*.proto`);
				break;
			case "node":
				fs.readdir(`./protos/${project["service"]}`, (err, files) => {
					files.forEach(file => {
						if (file.endsWith(".proto")) {
							var servicePath = "protos/" + project.service;
							exec(`grpc_tools_node_protoc --proto_path=${servicePath} --js_out=import_style=commonjs,binary:${output.path} --grpc_out=${output.path} --plugin=grpc_tools_node_protoc_plugin ${servicePath}/${file}`);
						}
					});					
				});
				break;
		}
	});
});