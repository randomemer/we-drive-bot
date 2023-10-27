FROM node:18 as base

# Clone bot source code and spin it up
WORKDIR /app

COPY . .

