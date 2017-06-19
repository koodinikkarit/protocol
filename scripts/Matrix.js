
export default class {
	constructor(client, {
		id,
		ip,
		port,
		numberOfConPorts,
		numberOfCpuPorts
	}) {
		this.client = client;
		var _id = id;
		var _ip = ip;
		var _port = port;
		var _numberOfConPorts = numberOfConPorts;
		var _numberOfCpuPorts = numberOfCpuPorts;
		
		Object.defineProperties(this, {
							"id": {
					get: undefined
				},				"ip": {
					get: () => {
	console.log("hermaani");
}
				},				"port": {
					get: undefined
				},				"numberOfConPorts": {
					get: undefined
				},				"numberOfCpuPorts": {
					get: undefined
				}
		});

		,() => {
	console.log("hermaani");
},,,
	}
}
