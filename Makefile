yml := docker-compose.yml
env ?= dev

image := we-drive-image
container := we-drive-container

.PHONY: start stop up down clean bot-sh db-sh logs build build-clean build-start

start:
	docker compose --env-file env/.env.$(env) -f $(yml) start
	docker compose --env-file env/.env.$(env) logs -f --tail=100

stop:
	docker compose --env-file env/.env.$(env) -f $(yml) stop

up:
	docker compose --env-file env/.env.$(env) -f $(yml) up --timeout 600

down:
	docker compose --env-file env/.env.$(env) -f $(yml) down

clean: stop
	docker compose --env-file env/.env.$(env) -f $(yml) down --rmi all -v

bot-sh:
	docker compose --env-file env/.env.$(env) -f $(yml) exec bot /bin/bash

db-sh:
	docker compose --env-file env/.env.$(env) -f $(yml) exec db bash -c 'mysql -u$$DB_USER -p$$DB_PASSWORD $$DB_NAME'

logs:
	docker compose --env-file env/.env.$(env) -f $(yml) logs --tail=100

build:
	docker build -t $(image) -f ./docker/Dockerfile.prod .
	docker run --env-file ./env/.env.prod --name $(container) $(image)

build-start:
	docker start $(container)

build-clean:
	docker stop $(container)
	docker rm $(container)
	docker image rm $(image)
