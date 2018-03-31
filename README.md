## Build

```sh
grpc_tools_node_protoc --js_out=import_style=commonjs,binary:../node/static_codegen/ --grpc_out=../node/static_codegen --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` helloworld.proto
```

## Depencies

go

```sh
go get github.com/golang/protobuf/proto
go get github.com/golang/protobuf/protoc-gen-go
```

npm

npm install -g grpc-tools

### build.config.json

Mahdolliset kielet go, node ja move.

```
{
	projects: [
		{
			"service": "service name",
			"protoOutputs": [
				{
					"lang": "go",
					"path": "build directory"
				}
			]
		}
	]
}
```

      "service": "matias",
      "protoOutputs": [
        {
          "lang": "go",
          "path":
            "C:\\Users\\pusan\\go\\src\\github.com\\koodinikkarit\\matias\\matias_service"
        },
        {
          "lang": "go",
          "path":
            "C:\\Users\\pusan\\go\\src\\github.com\\koodinikkarit\\seppo\\matias_service"
        }
      ]
