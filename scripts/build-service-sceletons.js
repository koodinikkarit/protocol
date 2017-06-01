var protobuf = require("protobufjs");
var fs = require("fs");
var path = require("path");

const capitalizeFirstLetter = require("./helpers").capitalizeFirstLetter;
const deCapalizeFirstLetter = require("./helpers").deCapalizeFirstLetter;
const capitalizeOnlyFirstLetter = require("./helpers").capitalizeOnlyFirstLetter;

const config = require("../build.config.json");

config.projects.forEach(project => {
	if (project.serviceSkeletons) {
		project.serviceSkeletons.forEach(output => {
			switch(output.lang) {
				case "go":
					buildGo(project.service, output.path);
			}
		});
	}
});


function buildGo(service, outputPath) {
	protobuf.load(`./protos/${service}/${service}_service.proto`, (err, root) => {
		var serviceClasses = root[`${capitalizeFirstLetter(service)}Service`];
		Object.keys(serviceClasses).some(name => {
			if (serviceClasses[name] instanceof protobuf.Service) {
				var serviceObject = serviceClasses[name];
				var fileContent;

				if (fs.existsSync(outputPath)) {
					fileContent = fs.readFileSync(outputPath, "utf8");
				}
				
				if (fileContent) {
					var lastPart = fileContent.split(/type server struct {(.*?)}/);
//`type server struct {
//	db *gorm.DB	
//}`);
					console.log("lastPart", lastPart);
				}

				Object.keys(serviceObject.methods).forEach(name => {

				});
				return true;
			}
		});
	});
}