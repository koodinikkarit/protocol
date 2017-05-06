import os, sys, json, shutil

# Open a file
basePath = "./"


# for fileName in os.listdir(basePath):
# 	path = os.path.join(basePath, fileName)
# 	if os.path.isdir(path) and not fileName.startswith("."):
# 		f = open(path + "/.protolangs")
# 		for line in f.readlines():
# 			if line == "node":
# 				print "grpc_tools_node_protoc --js_out=import_style=commonjs,binary:" + fileName + " --grpc_out=" + fileName + " --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` " + fileName + "/*.proto"
# 				os.system("grpc_tools_node_protoc --js_out=import_style=commonjs,binary:" + fileName + " --grpc_out=" + fileName + " --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` " + fileName + "/computer.proto")
# 		print "protoc --proto_path=" + fileName + " --proto_path=" + fileName + " --go_out=plugins=grpc:" + fileName + " " + fileName + "/*.proto"
# #		os.system("protoc --proto_path=" + fileName + " --proto_path=" + fileName + " --go_out=plugins=grpc:" + fileName + " " + fileName + "/*.proto");



with open("config.json") as json_file:
    config = json.load(json_file)
    for project in config["projects"]:
		for output in project["outputs"]:
			if not os.path.exists(output["path"]):
				os.makedirs(output["path"])
			if output["lang"] == "go":
				os.system("protoc --proto_path=" + project["service"] + " --go_out=plugins=grpc:" + output["path"] + " " + project["service"] + "/*.proto");
			elif output["lang"] == "node":
				files = os.listdir(project["service"])
				for file in files:
					if file.endswith(".proto"):
						#shutil.copy(project["service"] + "/" + file, output["path"] + "/" + file)
						os.system("grpc_tools_node_protoc --proto_path=" + project["service"] + " --js_out=import_style=commonjs,binary:" + output["path"] + " --grpc_out=" + output["path"] + " --plugin=grpc_tools_node_protoc_plugin " + project["service"] + "/" + file)


# cd ../../protos
# npm install -g grpc-tools
# grpc_tools_node_protoc --js_out=import_style=commonjs,binary:../node/static_codegen/ --grpc_out=../node/static_codegen --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` helloworld.proto
# grpc_tools_node_protoc --js_out=import_style=commonjs,binary:../node/static_codegen/route_guide/ --grpc_out=../node/static_codegen/route_guide/ --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` route_guide.proto