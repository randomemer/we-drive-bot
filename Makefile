yml := docker-compose.yml

.PHONY: start stop clean bot-sh

start:
	docker compose -f $(yml) up

stop:
	docker compose -f $(yml) stop

down:
	docker compose -f $(yml) down

clean: stop
	docker compose -f $(yml) down --rmi all -v

bot-sh:
	docker compose -f $(yml) exec bot /bin/bash

db-sh:
	docker compose -f $(yml) exec db mysql -uroot -p
