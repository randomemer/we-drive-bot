FROM node:18

# Clone wait-for-it.sh repo for waiting for db to be active
WORKDIR /opt

RUN git clone https://github.com/vishnubob/wait-for-it.git

# Clone bot source code and spin it up
WORKDIR /app

COPY . .

RUN chmod +x ./docker/setup.sh

RUN npm i -g nodemon

CMD [ "/bin/bash", "/opt/wait-for-it/wait-for-it.sh", "-t", "60", "db:3306", "--", "./docker/setup.sh" ]
