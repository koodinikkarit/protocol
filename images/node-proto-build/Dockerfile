FROM debian:jessie-20171210
WORKDIR /usr/src/
RUN apt-get update
RUN apt-get install -y curl unzip
RUN curl -OL https://github.com/google/protobuf/releases/download/v3.5.1/protoc-3.5.1-linux-x86_64.zip
RUN unzip protoc-3.5.1-linux-x86_64.zip -d protoc3
RUN ls protoc3
RUN mv protoc3/bin/* /usr/local/bin
RUN mv protoc3/include/* /usr/local/include
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN mkdir workdir
ADD package.json package.json
RUN npm install
ADD app.js app.js
CMD ["npm", "start"]