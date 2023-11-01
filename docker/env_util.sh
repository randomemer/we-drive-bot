#!/bin/bash

# List of environment variable names
env_var_names=("BOT_TOKEN" "BOT_APP_ID" "PTERODACTYL_API" "PTERODACTYL_API_KEY" "DB_NAME" "DB_HOST" "DB_USER" "DB_PASSWORD" "NODE_ENV")

rm -r env/
mkdir env
touch ./env/.env.prod

# Name of the environment file
env_file=".env.prod"

# Loop through the list of variable names and write them to the environment file
for key in "${env_var_names[@]}"; do
  val="${!key}"
  echo "${key}=${val}" >>"./env/$env_file"
done
