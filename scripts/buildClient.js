const protobuf = require("protobufjs");
const fs = require("fs");

const root = protobuf.loadSync("./protos/seppo/seppo_service.proto");

const findService = () => {};

const serviceKey = Object.keys(root).find(
	key => root[key] instanceof protobuf.Namespace
);

const service = root[serviceKey];

const isBasicType = type => {
	if (
		type === "bool" ||
		type === "string" ||
		type === "uint64" ||
		type === "uint32" ||
		type === "bytes"
	) {
		return true;
	}
	return false;
};

const convertBasicType = type => {
	switch (type) {
		case "bool":
			return "boolean";
		case "uint64":
			return "number";
		case "uint32":
			return "number";
		case "bytes":
			return "string";
		default:
			return "string";
	}
};

const capitalizeFirstLetter = s => {
	return s.charAt(0).toUpperCase() + s.slice(1);
};

const deCapalizeFirstLetter = s => {
	return s.charAt(0).toLowerCase() + s.slice(1);
};

const capitilizeOnlyFirstLetter = s => {
	const newS = s.toLowerCase();
	return capitalizeFirstLetter(newS);
};

fs.writeFileSync("tstypes.ts", "");
fs.writeFileSync("tsclass.ts", "");

const writeType = (type, parentType) => {
	if (type instanceof protobuf.Type) {
		type.nestedArray.forEach(newType => {
			writeType(newType, type);
		});

		fs.appendFileSync(
			"tstypes.ts",
			`
interface ${parentType ? parentType.name : ""}${type.name} {
	${type.fieldsArray
		.map(p => {
			const basicType = isBasicType(p.type);

			if (basicType) {
				return `${p.name}: ${convertBasicType(p.type)};`;
			}

			if (type.nested && type.nested[p.type]) {
				return `${p.name}: ${type.name}${p.type};`;
			}

			return `${p.name}: ${p.type};`;
		})
		.join("\n\t")}
}`
		);
	}

	if (type instanceof protobuf.Enum) {
		fs.appendFileSync(
			"tstypes.ts",
			`
export enum ${parentType ? parentType.name : ""}${type.name} {
	${Object.keys(type.values)
		.map(f => {
			const enumFieldName = f;
			const enumFieldValue = type.values[f];
			return `${f} = ${enumFieldValue}`;
		})
		.join(",\n\t")}
}
			`
		);
	}
};

Object.keys(service).forEach(namespaceFieldKey => {
	const namespaceField = service[namespaceFieldKey];
	writeType(namespaceField);

	if (namespaceField instanceof protobuf.Service) {
		console.log("service", namespaceField);
		fs.appendFileSync(
			"tsclass.ts",
			`
import * as grpc from "grpc";
import * as types from "./tstypes";

module.exports.${namespaceField.name}Client = class {
	client: RistoClient

	constructor(args: {
		ip: string,
		port: number
	}) {
		this.client = new RistoClient(
			args.ip + ":" + args.port,
			grpc.createInsecure()
		);
		
	}

	${namespaceField.methodsArray
		.map(m => {
			console.log("method", m);

			return `
	${m.name}(args: types.${m.requestType}): Promise<types.${m.responseType}> {
		return new Promise((resolve, reject) => {
			const req = new messages.${m.responseType}();
			${service[m.requestType].fieldsArray
				.map(e => {
					return `req.set${capitilizeOnlyFirstLetter(e.name)}(${
						e.name
					});`;
				})
				.join("\n\t\t\t")}

			this.client.${m.name}(req, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			})
		});
	}`;
		})
		.join("\n")}
}
	`
		);
	}
});

console.log("root", root, serviceKey, service);
