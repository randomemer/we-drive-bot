yml := docker-compose.yml

.PHONY: start stop up down clean bot-sh db-sh logs

start:
	docker compose -f $(yml) start

stop:
	docker compose -f $(yml) stop

up:
	docker compose -f $(yml) up --timeout 600

down:
	docker compose -f $(yml) down

clean: stop
	docker compose -f $(yml) down --rmi all -v

bot-sh:
	docker compose -f $(yml) exec bot /bin/bash

db-sh:
	docker compose -f $(yml) exec db bash -c 'mysql -uroot -p$$MYSQL_ROOT_PASSWORD $$MYSQL_DATABASE'

logs:
	docker compose -f $(yml) logs --tail=100
