var protobuf = require("protobufjs");

const capitalizeFirstLetter = require("./helpers").capitalizeFirstLetter;
const deCapalizeFirstLetter = require("./helpers").deCapalizeFirstLetter;
const capitalizeOnlyFirstLetter = require("./helpers").capitalizeOnlyFirstLetter;

module.exports = (file) => {
	return new Promise((resolve, reject) => {
		protobuf.load(file, (err, root) => {
			console.log("err", err);

			var service;
			var serviceClass;
			var entityClasses = {};
			var responseClasses = {};
			var enums = {};

			var serviceObject = root.WompattiService;

			Object.keys(serviceObject).forEach(key => {
				var thing = serviceObject[key];
				if (thing instanceof protobuf.Service) {
					service = thing;
				}
			});

			Object.keys(serviceObject).forEach(key => {
				var thing = serviceObject[key];
				if (thing instanceof protobuf.Type) {
					if (thing.name.endsWith("Response")) {
						var responseClass = {
							type: thing,
							name: thing.name,
							fields: []
						}

						Object.keys(thing.fields).map(p => thing.fields[p]).forEach(field => {
							var typeField = {
								name: field.name,
								typeName: field.type
							}
							if (serviceObject[field.type]) {
								typeField.scalar = false;
							} else {
								typeField.scalar = true;
							}
							responseClass.fields.push(typeField);
						});

						responseClasses[key] = responseClass;
					} else if (!thing.name.endsWith("Request") && !thing.name.endsWith("Response")) {
						var fields = Object.keys(thing.fields).map(p => thing.fields[p]).map(field => {
							var scalar;
							var fetchMethod;

							if (serviceObject[field.type]) {
								scalar = false;
							} else {
								scalar = true;
							}

							if (field.name.toLocaleLowerCase().endsWith("id")) {
								var method = service.methods["fetch" + capitalizeFirstLetter(field.name.replace("Id", "")) + "ById"];
								if (method) {
									var requestType = serviceObject[method.requestType];
									if (requestType) {
										fetchMethod = {
											name: method.name,
											requestTypeName: requestType.name
										}
									}
								}
							}

							return {
								name: field.name,
								typeName: field.type,
								scalar,
								fetchMethod,
							}
						});

						// Kohteet jotka viittaavat tähän id:seen.
						fields = fields.concat(Object.keys(service.methods).filter(p => p.endsWith("By" + capitalizeFirstLetter(thing.name) + "Id")).map(p => service.methods[p]).map(method => {
							return {
								name: deCapalizeFirstLetter(method.name.split("By")[0].replace("fetch", "")),
								scalar: false,
								fetchMethod: method.name
							}
						}));

						var entityClass = {
							name: thing.name,
							fields,
							type: thing,
							memberMethods: Object.keys(service.methods).map(p => service.methods[p])
								.filter(method => {
									var requestType = serviceObject[method.requestType];
									return !method.name.toLocaleLowerCase().startsWith("fetch" + thing.name.toLocaleLowerCase()) &&
										Object.keys(requestType.fields).some(p => p === thing.name.toLocaleLowerCase() + "Id")

								}).map(method => {
									var requestType = serviceObject[method.requestType];

									return {
										name: method.name,
										methodName: method.name.replace("By" + capitalizeFirstLetter(thing.name) + "Id", "")
											.replace("edit" + capitalizeFirstLetter(thing.name), ""),
										requestTypeName: requestType.name,
										fields: Object.keys(requestType.fields).map(p => requestType.fields[p]).map(field => {
											var scalar;
											var fetchMethod;

											if (serviceObject[field.type]) {
												scalar = false;
											} else {
												scalar = true;
											}

											return {
												name: field.name,
												typeName: field.type,
												scalar,
												fetchMethod
											}
										})
									}
								})
						}
						var m = entityClass.memberMethods.find(p => p.name.startsWith("edit" + entityClass.name));
						if (m) entityClass.editMethod = m.name;

						entityClasses[key] = entityClass;
					}
				} else if (thing instanceof Object && key.toLocaleLowerCase().includes("state")) {
					console.log("instance");
					enums[key] = {
						name: thing.name,
						fields: thing
					}
				}
			});

			resolve({
				serviceClass,
				entityClasses,
				responseClasses,
				enums
			});

		});
	});
}