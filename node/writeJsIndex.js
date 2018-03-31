const fs = require("fs");
const path = require("path");

const { capitilizeOnlyFirstLetter } = require("./strings");

module.exports = (definition, basePath) => {
	fs.writeFileSync(
		path.join(basePath, "index.js"),
		`
const client = require("./client");
const types = require("./types");
module.exports = Object.assign(client, types);	
	`
	);

	fs.writeFileSync(
		path.join(basePath, "client.js"),
		`
const grpc = require("grpc");
const service = require("./${definition.name}_service_grpc_pb");
const messages = require("./${definition.name}_service_pb");
const resolvers = require("./resolvers");

exports.${definition.client.name} = class {
	constructor(args) {
		this.client = new service.${definition.client.name}(
			args.ip + ":" + args.port,
			grpc.credentials.createInsecure()
		);	
	}
	${definition.client.methods
		.map(method => {
			return `${method.name}(${
				method.requestTypeHasFields ? `args` : ""
			}) {
		return  new Promise((resolve, reject) => {
			const req = new messages.${method.requestTypeName}();
			${definition.types
				.get(method.requestTypeName)
				.fields.map(field => {
					return `req.set${capitilizeOnlyFirstLetter(
						field.fieldName
					)}(args.${field.fieldName});`;
				})
				.join("\n\t\t\t")}

			this.client.${method.name}(req, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(resolvers.resolve${method.responseTypeName}(res));
				}
			});
		});
	}`;
		})
		.join("\n\t")}
}
	`
	);
};
