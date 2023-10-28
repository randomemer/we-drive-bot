FROM node:18

# Clone bot source code and spin it up
WORKDIR /app

COPY . .

RUN ["yarn", "install"]

RUN ["yarn", "knex", "migrate:latest"]

RUN ["yarn", "prestart"]

CMD [ "yarn", "start" ]
