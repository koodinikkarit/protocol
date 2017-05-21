var fs = require("fs");

var config = require("../petri/matti.config.json");

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


fs.readdir("./petri", (err, files) => {
	files.forEach(file => {
		if (file.endsWith(".config.json")) {
			var outputFilePath = "../petri/" + file.replace(".json", ".output.json");
			var config = require("../petri/" + file);
			var outputConfig = require(outputFilePath);
			executeConfig(config, outputConfig);
		}
	});
});


function executeConfig(config, outputConfig) {
fs.writeFile(__dirname + outputConfig.path + "index.js",
Object.keys(config.classes).map(name => `export{ default as ${name} } from "./${name}";`).join("\n"), error => {

});

Object.keys(config.classes).forEach(name => {
	var clas = config.classes[name];
	fs.writeFile(__dirname + outputConfig.path + name + ".js", 
	`
	${clas.depends ? clas.depends.map(p => `
	import ${p} from "./${p}";`).join("") : ""}

	const messages = require("./${config.name}_service_pb");
	const services = require("./${config.name}_service_grpc_pb");

	export default class ${name} {
		${clas.main ?`
		constructor(ip, port, credentials) {
			this.client = new services.${capitalizeFirstLetter(config.name)}Client(ip + ":" + port, credentials);
		}` :
		`
		constructor(client, {
			id,
			${clas.properties ? clas.properties.map(p => p.name).join(",\n\t\t\t") : ""}
		}) {
			this.client = client;
			Object.defineProperty(this, "id", {
				get: () => id
			});
			${clas.properties ? clas.properties.map(p => `this._${p.name} = ${p.name}`).join(";\n\t\t\t") : ""}
		}
		`}
		${clas.properties ? clas.properties.map(p => {
			var setter = "";
			var getter = "";

			if (p.set) {
				setter = `
		set ${p.name}(${p.name}) {
			this._${p.name} = ${p.name}
			this.client.${p.set}({
				id: this.id,
				${p.name}: ${p.name}
			}, (error, res) => {

			});
		}`;
			}

			if (p.get && p.type) {
				var clas2 = config.classes[p.type];
				if (clas2) {
					if (p.stream) {					
						getter = `
		get ${p.name}() {
			return new Promise((resolve, reject) => {
				var items = [];
				var call = this.client.${p.get}({
					${name.charAt(0).toLowerCase() + name.slice(1)}Id: this.id
				});

				call.on("data", o => {
					items.push(new ${p.type}(this.client, {
						id: o.getId(),
						${clas2.properties.filter(p => !p.stream).map(e => 
						`${e.name}${e.type ? "Id" : ""}: o.get${capitalizeOnlyFirstLetter(e.name)}${e.type ? "id" : ""}(),
						`).join("")}
					}))
				});

				call.on("end", () => {
					resolve(items);
				});
			});
		}`;
					} else {
						var lowerTypeName = p.type.charAt(0).toLowerCase() + p.type.slice(1);
						var typeProperties = [];
						clas2.properties.forEach(e => {
							if (!e.stream) typeProperties.push(e);
						});

						getter = `
		get	${p.name}() {
			return new Promise((resolve, reject) => {
				this.client.${p.get}({
					${lowerTypeName}Id: this._${lowerTypeName}Id
				}, (err, res) => {
					if (res.success) {
						resolve(new ${p.type}(this.client, {
							id: res.${lowerTypeName}.getId(),
							${typeProperties.map(e => 
							`${e.name}${e.type ? "Id" : ""}: res.${lowerTypeName}.get${capitalizeOnlyFirstLetter(e.name)}${e.type ? "id" : ""}()`
							).join(",\n\t\t\t\t\t")}
						}));
					}
				});
			});
		}`;
					}
				}
			} else {
				getter = `
		get ${p.name}() {
			return this._${p.name};
		}`;
			}

			return `
				${getter}
				${setter}
			`;
		}).join("") : ""}

		${clas.functions ? clas.functions.map(p => {
			var funcNameLower = p.funcName.charAt(0).toUpperCase() + p.funcName.slice(1)
			var req = `
				var req = new messages.${funcNameLower}Request();
				${p.member ? "req.setId(this.id);" : ""}
				${p.args ? p.args.map(arg => `req.set${capitalizeFirstLetter(arg)}(${arg});`).join("\n\t\t\t\t") : ""}
				`;

			if (!p.type) {
			return `
		${p.name}(${p.args ? p.args.map(e => e).join(",") : ""}) {
			${req}
			return new Promise((resolve, reject) => {
				this.client.${p.funcName}(req, (error, res) => {			
					if (res.success) {
						resolve();
					}
				});
			});
		}`
			} else {
				var clas2 = config.classes[p.type];
				var lowerTypeName = p.type.charAt(0).toLowerCase() + p.type.slice(1);
				var typeProperties = [];
				clas2.properties.forEach(e => {
					if (!e.stream) typeProperties.push(e);
				});
				if (p.stream) {
			return `
		${p.name}(${p.args.map(e => e).join(",")}) {
			return new Promise((resolve, reject) => {
				${req}
				var items = [];
				var call = this.client.${p.name}(req);

				call.on("data", o => {
					items.push(new ${p.type}(this.client, {
						id: o.getId(),
						${clas2.properties.filter(p => !p.stream).map(e => 
						`${e.name}${e.type ? "Id" : ""}: o.get${capitalizeOnlyFirstLetter(e.name)}${e.type ? "id" : ""}(),
						`).join("")}
					}))
				});

				call.on("end", () => {
					resolve(items);
				});
			});
		}`;
				} else {
			return `
		${p.name}(${p.args.map(e => e).join(",")}) {
			${req}
			this.client.${p.funcName}(req, (error, res) => {
				if (!error)
				resolve(new ${p.type}(this.client, {
					id: res.${lowerTypeName}.getId(),
					${typeProperties.map(e => 
					`${e.name}${e.type ? "Id" : ""}: res.${lowerTypeName}.get${capitalizeOnlyFirstLetter(e.name)}${e.type ? "id" : ""}()`
					).join(",\n\t\t\t\t\t")}
				}));
			})
		}`
				}
			}
		}).join("") : ""}

	}`);
});

}