FROM debian:jessie-20171210
WORKDIR /usr/src/
RUN apt-get update
RUN apt-get install -y curl unzip git
RUN curl -OL https://github.com/google/protobuf/releases/download/v3.5.1/protoc-3.5.1-linux-x86_64.zip
RUN unzip protoc-3.5.1-linux-x86_64.zip -d protoc3
RUN ls protoc3
RUN mv protoc3/bin/* /usr/local/bin
RUN mv protoc3/include/* /usr/local/include
RUN curl -O https://storage.googleapis.com/golang/go1.9.1.linux-amd64.tar.gz
RUN tar -xvf go1.9.1.linux-amd64.tar.gz
RUN mv go /usr/local
ENV PATH=$PATH:/usr/local/go/bin
RUN mkdir -p /usr/src/go-workdir
ENV GOPATH=/usr/src/go-workdir
ENV PATH=$PATH:/usr/src/go-workdir/bin
RUN go get github.com/golang/protobuf/proto
RUN go get github.com/golang/protobuf/protoc-gen-go
ADD compile.sh compile.sh
CMD ["bash", "compile.sh"]