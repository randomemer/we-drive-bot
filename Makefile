yml := docker-compose.yml
env ?= dev

.PHONY: start stop up down clean bot-sh db-sh logs

start:
	docker compose --env-file env/.env.$(env) -f $(yml) start
	docker compose --env-file env/.env.$(env) logs -f

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
	docker compose --env-file env/.env.$(env) -f $(yml) exec db bash -c 'mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE'

logs:
	docker compose --env-file env/.env.$(env) -f $(yml) logs --tail=100
