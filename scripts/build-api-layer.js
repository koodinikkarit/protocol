var protobuf = require("protobufjs");
var fs = require("fs");
var path = require("path");

const config = require("../build.config.json");

config.projects.forEach(project => {
	if (project.apiOutputs) {
		project.apiOutputs.forEach(apiOutput => {
			switch(apiOutput.lang) {
				case "node":
					buildNodeApi(project.service, apiOutput.path);
					break;
			}
		});
	}
});

function buildNodeApi(service, outputPath) {
	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath);
	}
	protobuf.load(`./protos/${service}/${service}_service.proto`, (err, root) => {
		var serviceObject = root[`${capitalizeFirstLetter(service)}Service`];
		var importFiles = Object.keys(serviceObject).filter(name => {
			var thing = serviceObject[name];
			if ((thing instanceof protobuf.Service ||
				thing instanceof protobuf.Type) && 
				(!name.endsWith("Request") && !name.endsWith("Response"))) {
				return true;
			}
		});
		fs.writeFileSync(path.join(outputPath, "index.js"), `
${importFiles.map(p => `export { default as ${p} } from "./${p}";`).join("\n")}
`);
		Object.keys(serviceObject).some(name => {
			if (serviceObject[name] instanceof protobuf.Service) {
				service = serviceObject[name];
				WriteService(service, name, serviceObject, outputPath);
				return true;
			}
		});

		Object.keys(serviceObject).forEach(name => {
			if (serviceObject[name] instanceof protobuf.Type) {
				if (!name.includes("Request") && !name.includes("Response")) {
					WriteClass(serviceObject[name], service, serviceObject, outputPath);
				}
			}
		});
	});
}




function WriteService(service, packageName, types, outputPath) {
	var filenameParts = service.filename.split("/");
	var serviceFilename = filenameParts[filenameParts.length - 1].replace(".proto", "");
	var methods = [];

	Object.keys(service.methods).forEach(name => {
		var method = service.methods[name];
		var type = types[method.requestType];
		var requestParameters = Object.keys(type.fields).map(p => type.fields[p].name);
		var requestSetParameters = requestParameters.map(p => "set" + capitalizeOnlyFirstLetter(p));
		methods.push(
`
	${method.name}({
		${requestParameters.join(",\n\t\t")}
	}) {
		return new Promise((resolve, reject) => {
			var req = new messages.${method.requestType}();
			${requestSetParameters.map((p, index) => `req.${p}(${requestParameters[index]});`).join("\n\t\t\t")}
			${getMethod(method, types)}
		});
	}
`
		)
	});

	fs.writeFileSync(path.join(outputPath, service.name + ".js"), 
`
import * as classes from "./";

const messages = require("./${serviceFilename}_pb");
const services = require("./${serviceFilename}_grpc_pb");

export default class ${service.name} {
	constructor(ip, port, credentials) {
		this.client = new services.${packageName}Client(ip + ":" + port, credentials);
	}
${methods.join("")}

}



`)
}


function WriteClass(message, service, types, outputPath) {
	var filenameParts = service.filename.split("/");
	var serviceFilename = filenameParts[filenameParts.length - 1].replace(".proto", "");
	var fields = Object.keys(message.fields);
	var messageNameLowerCase = message.name.toLowerCase();

	var editMethod = service.methods[Object.keys(service.methods).find(p => p === `edit${message.name}`)];
	var editMethodFields;
	if (editMethod) {
		editMethodFields = Object.keys(types[editMethod.requestType].fields)
	}

	var propertyIds = Object.keys(message.fields).filter(p => p.endsWith("Id")); 

	var memberMethods = Object.keys(service.methods).map(p => service.methods[p]).filter(p => {
		var requestType = types[p.requestType];
		if (Object.keys(requestType.fields).some(e => e.toLowerCase().includes(messageNameLowerCase) ||
												 propertyIds.some(r => {
													 var ttt = r === e;
													  return r === e
												 }))) return true;
	}).filter(p => {
		if (p.responseStream) {
			if (p.responseType !== message.name) return true;
		} else {
			var responseType = types[p.responseType];
			return Object.keys(responseType.fields).map(p => responseType.fields[p]).some(p => {
				return !types[p.type] || p.type !== message.name
			});
		}
	});

	var fetchMemberMethods = memberMethods.filter(p => p.name.startsWith("fetch") && Object.keys(types[p.requestType].fields).length === 1);

	var fetchProperties = fetchMemberMethods.map(p => {
		var fetchPropertiesRequestType = types[p.requestType];
		var requestType = types[p.requestType];
		var sameFields = Object.keys(requestType.fields).filter(e => Object.keys(fetchPropertiesRequestType.fields).some(f => f === e));

		return {
			name: deCapalizeFirstLetter(p.name.replace("fetch", "").split("By")[0]),
			method: p,
			sameFields
		};
	});
	
	var memberMethodStrings = memberMethods.map(p => {
		var requestType = types[p.requestType];
		var fields = Object.keys(requestType.fields).filter(e => !e.toLowerCase().includes(messageNameLowerCase));
		return `
	${p.name}(${fields.length > 0 ? `{
		${fields.map(e => e).join(",\n\t\t")}
	}` : ""}) {
		return new Promise((resolve, reject) => {
			var req = new messages.${p.requestType}();
			${Object.keys(requestType.fields).map(p => {
				if (p.toLowerCase().includes(messageNameLowerCase)) {
					return `req.set${capitalizeOnlyFirstLetter(p)}(this.id)`;
				} else {
					return `req.set${capitalizeOnlyFirstLetter(p)}(${p})`;
				}
			}).join(";\n\t\t\t")}
			${getMethod(p, types)}
		});
	}`;		
	});

	fs.writeFileSync(path.join(outputPath, message.name + ".js"), `
import * as classes from "./";

const messages = require("./${serviceFilename}_pb");

export default class {
	constructor(client, {
		${fields.join(",\n\t\t")}
	}) {
		this.client = client;
		${fields.map(p => `var _${p} = ${p};`).join("\n\t\t")}

		Object.defineProperties(this, {
			${fields.map(p => {
			return`"${p}": {
				get: () => _${p}${p !== "id" && editMethod && editMethodFields.some(e => e === p) ? `,
				set: (${p}) => {
					_${p} = ${p}
					var req = new messages.${editMethod.requestType}();
					req.set${capitalizeOnlyFirstLetter(message.name)}id(_id);
					req.set${capitalizeOnlyFirstLetter(p)}(_${p});
					this.client.${editMethod.name}(req, (erro, res) => {

					});
				}` : "" }
			},`
			}).join("\n\t\t\t")}
			${fetchProperties.map(e =>
			`"${e.name}": {
				get: () => {
					return new Promise((resolve, rejected) => {
						var req = new messages.${e.method.requestType}();
						${e.sameFields.map(f => {
							if (f.toLowerCase() === message.name.toLowerCase() + "id") return `req.set${capitalizeOnlyFirstLetter(message.name)}id(_id);`;
							else return `req.set${capitalizeOnlyFirstLetter(f)}(_${f});`;
						}).join("\n\t\t\t")}
						
						${getMethod(e.method, types)}
					});
				}
			}`).join(",\n\t\t\t")}
		})
	}

	${memberMethodStrings.join("\n")}
}	
	
	`);
}

// req.set${capitalizeOnlyFirstLetter(message.name)}id(_id);

function getClassMethod(method, types) {

}

function getMethod(method, types) {
	if (method.responseStream) {
		var responseType = types[method.responseType];
		var fields = Object.keys(responseType.fields);

		return `
			var call = this.client.${method.name}(req);
			var items = [];

			call.on("data", data => {
				items.push(new classes.${method.responseType}({
					${fields.map(p => `${p}: data.get${capitalizeOnlyFirstLetter(p)}()`).join(",\n\t\t\t\t\t")}
				}));
			});

			call.on("end", () => {
				resolve(items);
			});`;
	} else {
		var responseType = types[method.responseType];
		var returnTypes = Object.keys(responseType.fields).map(p => responseType.fields[p]).filter(p => types[p.type]).map(p => types[p.type]);
		var returnType;
		if (returnTypes.length > 0) {
			returnType = returnTypes[0];
			fields = Object.keys(returnType.fields);
		}
		
		if (returnType) {
			return `
			this.client.${method.name}(req, (err, res) => {
				resolve(new classes.${returnType.name}({
					${fields.map(p => `${p}: res.${returnType.name.toLowerCase()}.get${capitalizeOnlyFirstLetter(p)}`).join(",\n\t\t\t\t\t")}
				}));
			});`;
		} else {
			return `
			this.${method.name}(req, (err, res) => {
				resolve();
			});`;
		}
	}
}

function GetServiceImports(service) {

}


function capitalizeFirstLetter(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function deCapalizeFirstLetter(s) {
	return s.charAt(0).toLowerCase() + s.slice(1);
}

function capitalizeOnlyFirstLetter(s) {
	var newS = s.toLowerCase();
	return capitalizeFirstLetter(newS);
}
