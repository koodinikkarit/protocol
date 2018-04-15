const path = require("path");
const fs = require("fs");
const execSync = require("child_process").execSync;

const protosDirPath = "/usr/src/protos";
const outputDirPath = "/usr/src/output";

fs.readdirSync("/usr/src/protos").forEach(fileName => {
	const grpcBuildFileCommand = `grpc_tools_node_protoc --proto_path=${protosDirPath} --js_out=import_style=commonjs,binary:${outputDirPath} --grpc_out=${outputDirPath} --plugin=grpc_tools_node_protoc_plugin ${path.join(
		protosDirPath,
		fileName
	)}`;
	execSync(grpcBuildFileCommand);
});

const buildTypedefinionsCommand = `protoc --ts_out=${outputDirPath} --plugin=./node_modules/.bin/protoc-gen-ts -I ${protosDirPath} ${path.join(
	protosDirPath,
	"*.proto"
)}`;
execSync(buildTypedefinionsCommand);

const jsProtoIndexFile = "protoindex.js";
const tsProtoIndexFile = "protoindex.d.ts";

const jsProtoIndexFilePath = path.join(outputDirPath, jsProtoIndexFile);
const tsProtoIndexFilePath = path.join(outputDirPath, tsProtoIndexFile);

fs.writeFileSync(tsProtoIndexFilePath, "");

fs.readdirSync(outputDirPath).forEach(fileName => {
	if (fileName !== jsProtoIndexFile && fileName !== tsProtoIndexFile) {
		if (fileName.endsWith(".ts")) {
			fs.appendFileSync(
				tsProtoIndexFilePath,
				`export * from "./${fileName.split(".")[0]}";\n`
			);
		}
	}
});

const serviceFileName = process.env.SERVICE_FILE_NAME;

fs.writeFileSync(
	jsProtoIndexFilePath,
	`
const messages = require("./${serviceFileName}_pb.js");
const service = require("./${serviceFileName}_grpc_pb.js");
module.exports = Object.assign(
	messages,
	service
);
`
);

const jsIndexFile = "index.js";
const tsIndexFile = "index.d.ts";

const jsIndexFilePath = path.join(outputDirPath, jsIndexFile);
const tsIndexFilePath = path.join(outputDirPath, tsIndexFile);

fs.writeFileSync(
	jsIndexFilePath,
	`const client = require("./client.js");
const types = require("./types");
module.exports = Object.assign(
	types,
	client
);`
);

fs.writeFileSync(
	tsIndexFilePath,
	`export * from "./client";
export * from "./types";`
);
