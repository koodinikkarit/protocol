
const fs = require("fs");

const GetDefinitions = require("./GetDefinitions");

var wompatti = GetDefinitions("./protos/wompatti_service.proto");
wompatti.then(data => {
	console.log("data");
	Object.keys(data.entityClasses).map(p => data.entityClasses[p]).forEach((entityClass) => {
		fs.writeFileSync("./build/" + entityClass.name + ".js", `
import classes from "./"

export default class {
	constructor(context, {
		${entityClass.fields.map(p => p.name).join(",\n\t\t")}
	}) {
		${entityClass.fields.map(p => `var _${p.name} = ${p.name};`).join("\n\t\t")}

		Object.defineProperties(this, {
			${entityClass.fields.filter(p => p.fetchMethod).map(p => 
			`"${p.name}": {
				get: () => {
					return context.loaders.${p.fetchMethod.name}(_${p.name});
				}${entityClass.editMethod ? `,
				set: (${p.name}) => {
					_${p.name} = ${p.name};
					context.${entityClass.editMethod}({
						id: _id,
						${p.name}
					})
				}` : ""}	
			}`).join(",\n\t\t\t")}
		})
	}
	${entityClass.memberMethods.map(p => 
	`${p.name}(${p.fields.length > 0 ? `{
		${p.fields.map(field => field.name).join(",\n\t\t")}	
	}` : ""}) {
		
	}`).join("\n\n\t")}
}
`);
	});
});