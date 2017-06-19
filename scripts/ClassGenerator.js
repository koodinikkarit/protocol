const fs = require("fs");

module.exports = class ClassGenerator {
	constructor({
		name
	}) {
		this.name = name;
		this.properties = [];
	}

	addProperty(propertyName, fn) {
		this.properties.push({
			name: propertyName,
			fn
		});
	}

	render() {
		fs.writeFileSync(this.name + ".js", `
export default class {
	constructor(client${this.properties.length > 0 ?`, {\n\t\t${this.properties.map(p => p.name).join(",\n\t\t")}\n\t}` : ""}) {
		this.client = client;
		${this.properties.map(p => `var _${p.name} = ${p.name};`).join("\n\t\t")}
		${this.properties.length > 0 ? `
		Object.defineProperties(this, {
			${this.properties.map(p =>
`				"${p.name}": {
					get: ${p.fn}
				}`).join(",")}
		});` : ""}

		${this.properties.map(p => p.fn)}
	}
}
`)
	}
}