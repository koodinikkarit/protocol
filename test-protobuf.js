var protobuf = require("protobufjs");
var fs = require("fs");

protobuf.load("./protos/matti/matti_service.proto", (err, root) => {
	var matti = root.MattiService.Matti;

	Object.keys(root.MattiService).forEach(name => {
		if (root.MattiService[name] instanceof protobuf.Type) {
		} else if (root.MattiService[name] instanceof protobuf.Service) {
			console.log("Se on service");
			WriteService(root.MattiService[name], name, root.MattiService);
		}
	});
});

function WriteService(service, packageName, types) {
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
			${requestSetParameters.map((p, index) => `req.${p}(${requestParameters[index]});`).join("\n\t\t")}
			${getMethod(method, types)}
		});
	}
`
		)
	});


	fs.writeFileSync("./build/" + service.name + ".js", 
`

const messages = require("./${serviceFilename}_pb");
const service = require("./${serviceFilename}_grpc_pb");

export default class ${service.name} {
	constructor(ip, port, credentials) {
		this.client = new services.${packageName}(ip + ":" + port, credentials);
	}
${methods.join("")}

}



`)
}

function getMethod(method, types) {
	if (method.responseStream) {
		var responseType = types[method.responseType];
		var fields = Object.keys(responseType.fields);

		return `
			var call = this.${method.name}(req);
			var items = [];

			call.on("data", data => {
				items.push(new ${method.responseType}({
					${fields.map(p => `${p}: data.get${capitalizeOnlyFirstLetter(p)}()`).join(",\n\t\t\t\t\t")}
				}));
			});

			call.on("end", () => {
				resolve(items);
			});`;
	} else {
		var responseType = types[method.responseType];
		var returnTypes = Object.keys(responseType.fields).map(p => responseType.fields[p]).filter(p => types[p.type]).map(p => types[p.type]);
		if (returnTypes.length > 0) {
		var returnType = returnTypes[0];
		var fields = Object.keys(returnType.fields);

		return `
			this.${method.name}(req, (err, res) => {
				resolve(new ${returnType.name}({
					${fields.map(p => `${p}: res.${returnType.name.toLowerCase()}.get${capitalizeOnlyFirstLetter(p)}`).join(",\n\t\t\t\t\t")}
				}));
			});
	`
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
