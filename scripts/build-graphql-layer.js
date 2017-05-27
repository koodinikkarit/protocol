var protobuf = require("protobufjs");
var fs = require("fs");
var path = require("path");

const capitalizeFirstLetter = require("./helpers").capitalizeFirstLetter;
const deCapalizeFirstLetter = require("./helpers").deCapalizeFirstLetter;
const capitalizeOnlyFirstLetter = require("./helpers").capitalizeOnlyFirstLetter;

const config = require("../build.config.json");

config.projects.forEach(project => {
	if (project.graphqlOutputs) {
		project.graphqlOutputs.forEach(graphqlOutput => {
			switch(graphqlOutput.lang) {
				case "node":
					buildNodeGraphql(project.service, graphqlOutput.path);
			}
		});
	}
});


function buildNodeGraphql(service, outputPath) {
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
		}).map(p => {
			var thing = serviceObject[p];
			if (thing instanceof protobuf.Service) {
				return {
					name: p,
					isService: true
				};
			} else if (thing instanceof protobuf.Type) {
				return {
					name: p,
					isService: false
				};
			}
		}).reverse();
		fs.writeFileSync(path.join(outputPath, "index.js"), `${importFiles.map(p => {
			if (p.isService) {
				return `export {
	${serviceObject.name}Queries,
	${serviceObject.name}Mutations
} from "./${p.name}";`;
			} else {
				return `export { default as ${p.name} } from "./${p.name}";`;
			}
		}).join("\n")}`);
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
	var fetchMethods = [];
	var editMethods = [];

	Object.keys(service.methods).forEach(name => {
		var method = service.methods[name];
		var requestType = types[method.requestType];
		var responseType = types[method.responseType];		
		var requestParameters = Object.keys(requestType.fields).map(p => requestType.fields[p]);

		var methodList;

		if (name.startsWith("fetch")) methodList = fetchMethods;
		else methodList = editMethods;

		methodList.push(
`${method.name}: {
		"name": "${method.name}",
		"type": ${method.responseStream ? `new GraphQLList(classes.${getMethodType(method, types)})` : getMethodType(method, types) ? `classes.${getMethodType(method, types)}` : "GraphQLBoolean"},
		"args": {
			${requestParameters.map(p => `${p.name}: {
				type: ${getGraphqlTypeName(p.type)}
			}`).join(",\n\t\t\t")}
		},
		resolve: (root, {
			${requestParameters.map(p => p.name).join(",\n\t\t\t")}
		}, context) => new Promise((resolve, reject) => {
			resolve(context.${deCapalizeFirstLetter(service.name)}.${method.name}({
				${requestParameters.map(p => p.name).join(",\n\t\t\t\t")}
			}));
		})
	}`
		)
	});

		fs.writeFileSync(path.join(outputPath, service.name + ".js"), 
`
import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
	GraphQLBoolean
} from "graphql";

import * as classes from "./";

export const ${service.name}ServiceQueries = {
	${fetchMethods.join(",\n\t")}
}

export const ${service.name}ServiceMutations = {
	${editMethods.join(",\n\t")}
}
`);
}

function WriteClass(message, service, types, outputPath) {
	var filenameParts = service.filename.split("/");
	var serviceFilename = filenameParts[filenameParts.length - 1].replace(".proto", "");
	var fields = Object.keys(message.fields).map(p => {
		var type;
		var field = message.fields[p];
		var type = getGraphqlTypeName(field.type);

		return {
			name: field.name,
			type
		};
	});
	var messageNameLowerCase = message.name.toLowerCase();


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
		

		return {
			name: deCapalizeFirstLetter(p.name.replace("fetch", "").split("By")[0]),
			method: p,
			type: p.responseStream ? ` new GraphQLList(classes.${getMethodType(p, types)})` : `classes.${getMethodType(p, types)}`
		};
	});
	



	fs.writeFileSync(path.join(outputPath, message.name + ".js"), `
import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt	
} from "graphql";

import * as classes from "./";

export default new GraphQLObjectType({
	name: "${message.name}",
	fields: () => ({
		${fields.map(p => `${p.name}: {
			type: ${p.type}
		}`).join(",\n\t\t")},
		${fetchProperties.map(p => `${p.name}: {
			type: ${p.type}
		}`).join(",\n\t\t")}
	})
})`);
}


function getMethodType(method, types) {
	if (method.responseStream) {
		return method.responseType;
	} else {
		var responseType = types[method.responseType];
		var returnTypes = Object.keys(responseType.fields).map(p => responseType.fields[p]).filter(p => types[p.type]).map(p => types[p.type]);
		var returnType;
		if (returnTypes.length > 0) {
			return returnTypes[0].name;
		}
	}
}

function getGraphqlTypeName(protoType) {
	switch(protoType) {
		case "uint32":
			return "GraphQLInt";
		case "string":
			return "GraphQLString";
		case "uint64":
			return "GraphQLInt";
	}	
}