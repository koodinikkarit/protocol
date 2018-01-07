for file in /usr/src/protos/*; do
  echo ${file##*/}
done
protoc --proto_path=/usr/src/protos --go_out=plugins=grpc:/usr/src/output /usr/src/protos/*.proto