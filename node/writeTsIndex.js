const fs = require("fs");
const path = require("path");

const writeJsResolver = require("./writeJsResolvers");

module.exports = (definitions, basePath) => {
	writeJsResolver(definitions, basePath);

	fs.writeFileSync(
		path.join(basePath, "index.d.ts"),
		`
export * from "./client";
export * from "./types";	
	`
	);

	fs.writeFileSync(path.join(basePath, "types.d.ts"), "");
	fs.writeFileSync(path.join(basePath, "types.js"), "");

	definitions.types.forEach((value, key) => {
		if (value.type === "enum") {
			fs.appendFileSync(
				path.join(basePath, "types.d.ts"),
				`
export enum ${key} {
	${value.fields
		.map(field => {
			return `${field.enumKey} = ${field.enumValue}`;
		})
		.join(",\n\t")}
}
`
			);

			fs.appendFileSync(
				path.join(basePath, "types.js"),
				`
exports.${key} = {
	${value.fields
		.map(field => {
			return `${field.enumKey}: ${field.enumValue}`;
		})
		.join(",\n\t")}
}		
			`
			);
		}

		if (value.type === "interface") {
			fs.appendFileSync(
				path.join(basePath, "types.d.ts"),
				`
export interface ${key} {
	${value.fields
		.map(field => {
			return `${field.fieldName}${field.required ? "" : "?"}: ${
				field.jsTypeName
			};`;
		})
		.join("\n\t")}
}
`
			);
		}
	});

	fs.writeFileSync(
		path.join(basePath, "client.d.ts"),
		`import * as types from "./types";

export class ${definitions.client.name} {
	constructor(args: {
		ip: string,
		port: number
	});
	${definitions.client.methods
		.map(method => {
			return `${method.name}(${
				method.requestTypeHasFields
					? `args: types.${method.requestTypeName}`
					: ""
			}): Promise<types.${method.responseTypeName}>;`;
		})
		.join("\n\t")}
}
	`
	);
};
