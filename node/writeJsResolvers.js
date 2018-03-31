const path = require("path");
const fs = require("fs");
const { capitilizeOnlyFirstLetter } = require("./strings");

module.exports = (definitions, basePath) => {
	fs.writeFileSync(path.join(basePath, "resolvers.js"), "");

	definitions.types.forEach((value, key) => {
		if (value.type === "enum") {
			fs.appendFileSync(
				path.join(basePath, "resolvers.js"),
				`
exports.resolve${key} = function(input) {
	return input;
}`
			);
		}

		if (value.type === "interface") {
			fs.appendFileSync(
				path.join(basePath, "resolvers.js"),
				`
exports.resolve${key} = function(input) {
	const res = {};
	${value.fields
		.map(field => {
			if (field.isBasicType) {
				if (field.isListType) {
					return `res.${
						field.fieldName
					} = input.get${capitilizeOnlyFirstLetter(
						field.fieldName
					)}List();`;
				}
				return `res.${
					field.fieldName
				} = input.get${capitilizeOnlyFirstLetter(field.fieldName)}();`;
			}

			if (field.isListType) {
				return `
	if (input.get${capitilizeOnlyFirstLetter(field.fieldName)}List()) {
		res.${field.fieldName} = input.get${capitilizeOnlyFirstLetter(
					field.fieldName
				)}List().map(p => exports.resolve${field.jsTypeName}(p));
	}`;
			}

			return `
	if (input.get${capitilizeOnlyFirstLetter(field.fieldName)}() != null) {
		res.${field.fieldName} = exports.resolve${
				field.jsTypeName
			}(input.get${capitilizeOnlyFirstLetter(field.fieldName)}())
	}
	`;
		})
		.join("\n\t")}
	return res;
}`
			);
		}
	});
};
