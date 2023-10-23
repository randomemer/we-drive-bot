set -e

yarn knex migrate:latest

yarn dev
