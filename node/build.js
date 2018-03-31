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

const getDerfinitions = require("./getDefinitions");
const writeTsIndex = require("./writeTsIndex");
const writeJsIndex = require("./writeJsIndex");

const d = getDerfinitions(
	path.resolve(inputDirPath, serviceFileName + ".proto")
);
writeTsIndex(d, outputDirPath);
writeJsIndex(d, outputDirPath);

// const protobuf = require("protobufjs");

// const root = protobuf.loadSync(
// 	path.resolve(inputDirPath, "risto_service.proto")
// );

// const findService = () => {};

// const serviceKey = Object.keys(root).find(
// 	key => root[key] instanceof protobuf.Namespace
// );

// const service = root[serviceKey];

// const isBasicType = type => {
// 	if (
// 		type === "bool" ||
// 		type === "string" ||
// 		type === "uint64" ||
// 		type === "uint32" ||
// 		type === "bytes"
// 	) {
// 		return true;
// 	}
// 	return false;
// };

// const convertBasicType = type => {
// 	switch (type) {
// 		case "bool":
// 			return "boolean";
// 		case "uint64":
// 			return "number";
// 		case "uint32":
// 			return "number";
// 		case "bytes":
// 			return "string";
// 		default:
// 			return "string";
// 	}
// };

// const capitalizeFirstLetter = s => {
// 	return s.charAt(0).toUpperCase() + s.slice(1);
// };

// const deCapalizeFirstLetter = s => {
// 	return s.charAt(0).toLowerCase() + s.slice(1);
// };

// const capitilizeOnlyFirstLetter = s => {
// 	const newS = s.toLowerCase();
// 	return capitalizeFirstLetter(newS);
// };

// const typesFilePath = path.resolve(outputDirPath, "types.ts");
// const clientFilePath = path.resolve(outputDirPath, "client.ts");

// fs.writeFileSync(typesFilePath, "");
// fs.writeFileSync(clientFilePath, "");

// const writeType = (type, parentType) => {
// 	if (type instanceof protobuf.Type) {
// 		type.nestedArray.forEach(newType => {
// 			writeType(newType, type);
// 		});

// 		fs.appendFileSync(
// 			typesFilePath,
// 			`
// export interface ${parentType ? parentType.name : ""}${type.name} {
// 	${type.fieldsArray
// 		.map(p => {
// 			const basicType = isBasicType(p.type);

// 			if (basicType) {
// 				return `${p.name}: ${convertBasicType(p.type)};`;
// 			}

// 			if (type.nested && type.nested[p.type]) {
// 				return `${p.name}: ${type.name}${p.type};`;
// 			}

// 			return `${p.name}: ${p.type};`;
// 		})
// 		.join("\n\t")}
// }`
// 		);
// 	}

// 	if (type instanceof protobuf.Enum) {
// 		fs.appendFileSync(
// 			typesFilePath,
// 			`
// export enum ${parentType ? parentType.name : ""}${type.name} {
// 	${Object.keys(type.values)
// 		.map(f => {
// 			const enumFieldName = f;
// 			const enumFieldValue = type.values[f];
// 			return `${f} = ${enumFieldValue}`;
// 		})
// 		.join(",\n\t")}
// }
// 			`
// 		);
// 	}
// };

// Object.keys(service).forEach(namespaceFieldKey => {
// 	const namespaceField = service[namespaceFieldKey];
// 	writeType(namespaceField);

// 	if (namespaceField instanceof protobuf.Service) {
// 		fs.appendFileSync(
// 			clientFilePath,
// 			`
// import * as grpc from "grpc";

// import * as types from "./types";
// import * as index from "./protoindex";

// export class ${namespaceField.name}Client {
// 	client: index.${namespaceField.name}Client;

// 	constructor(args: {
// 		ip: string,
// 		port: number
// 	}) {
// 		this.client = new index.${namespaceField.name}Client(
// 			args.ip + ":" + args.port,
// 			grpc.createInsecure()
// 		);

// 	}
// 	${namespaceField.methodsArray
// 		.map(m => {
// 			const requestTypeHasFields =
// 				service[m.requestType].fieldsArray.length > 0;

// 			return `
// 	${m.name}(${
// 				requestTypeHasFields ? `args: types.${m.requestType}` : ""
// 			}): Promise<types.${m.responseType}> {
// 		return new Promise((resolve, reject) => {
// 			const req = new index.${m.requestType}();
// 			${service[m.requestType].fieldsArray
// 				.map(e => {
// 					return `req.set${capitilizeOnlyFirstLetter(e.name)}(args.${
// 						e.name
// 					});`;
// 				})
// 				.join("\n\t\t\t")}

// 			this.client.${m.name}(req, (err, res) => {
// 				if (err) {
// 					reject(err);
// 				} else {
// 					resolve(res);
// 				}
// 			})
// 		});
// 	}`;
// 		})
// 		.join("\n")}
// }
// 	`
// 		);
// 	}
// });

// // const indexFile = path.resolve(outputDirPath, "index.js");
// const indexTsFile = path.resolve(outputDirPath, "index.ts");

// // fs.writeFileSync(
// // 	indexFile,
// // 	`
// // const types = require("./types");
// // const client = require("./protoindex");
// // module.exports = Object.assign(
// // 	types,
// // 	client
// // );`
// // );

// fs.writeFileSync(
// 	indexTsFile,
// 	`
// export * from "./types";
// export * from "./client";`
// );

// //console.log("root", root, serviceKey, service);
