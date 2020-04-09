FROM node:latest
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev libkrb5-dev

RUN mkdir /app
WORKDIR /app

COPY back/package.json .
RUN npm install
COPY back/index.js ./
COPY back/schema.js ./


CMD node index.js
EXPOSE 3000
