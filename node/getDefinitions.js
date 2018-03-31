const protobuf = require("protobufjs");

const isFieldBasicType = type => {
	if (
		type === "bool" ||
		type === "string" ||
		type === "uint64" ||
		type === "uint32" ||
		type === "int64" ||
		type === "int" ||
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
		case "int64":
			return "number";
		case "int":
			return "number";
		case "bytes":
			return "string";
		default:
			return "string";
	}
};

const getType = (types, type, parentType) => {
	if (type instanceof protobuf.Type) {
		type.nestedArray.forEach(newType => {
			getType(types, newType, type);
		});

		const newTypeName = parentType
			? parentType.name + type.name
			: type.name;

		const newType = {
			name: newTypeName,
			type: "interface",
			fields: type.fieldsArray.map(field => {
				const fieldName = field.name;
				const fieldTypeName = field.type;
				const isBasicType = isFieldBasicType(field.type);
				const isListType = field.repeated;
				const required = field.required;
				let jsTypeName = "";

				if (!isBasicType) {
					if (type.nested && type.nested[field.type]) {
						jsTypeName = newTypeName + field.type;
					} else {
						jsTypeName = field.type;
					}
				} else {
					jsTypeName = convertBasicType(field.type);
				}

				return {
					fieldName,
					fieldTypeName,
					jsTypeName,
					isBasicType,
					isListType,
					required
				};
			})
		};

		types.set(newType.name, newType);
	}

	if (type instanceof protobuf.Enum) {
		const newType = {
			name: parentType ? parentType.name + type.name : type.name,
			type: "enum",
			fields: Object.keys(type.values).map(key => {
				const enumKey = key;
				const enumValue = type.values[key];

				return {
					enumKey,
					enumValue
				};
			})
		};
		types.set(newType.name, newType);
	}
};

module.exports = filePath => {
	let name = "";
	const types = new Map();
	const client = {
		name: "",
		methods: []
	};

	const root = protobuf.loadSync(filePath);

	const serviceNamespaceKey = Object.keys(root).find(
		key => root[key] instanceof protobuf.Namespace
	);

	const serviceNamespace = root[serviceNamespaceKey];

	serviceNamespace.nestedArray.forEach(namespaceField => {
		if (
			namespaceField instanceof protobuf.Type ||
			namespaceField instanceof protobuf.Enum
		) {
			getType(types, namespaceField);
			return;
		}

		if (namespaceField instanceof protobuf.Service) {
			name = namespaceField.name.toLowerCase();
			client.name = namespaceField.name + "Client";

			namespaceField.methodsArray.forEach(m => {
				const requestType = serviceNamespace[m.requestType];
				const responseType = serviceNamespace[m.responseType];

				const newMethod = {
					name: m.name,
					requestTypeHasFields: requestType.fieldsArray.length > 0,
					requestTypeName: m.requestType,
					responseTypeName: m.responseType
				};

				client.methods.push(newMethod);
			});
			return;
		}
	});
	return {
		name,
		client,
		types
	};
};
