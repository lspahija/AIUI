#!/bin/bash
set -e

if [ "$(docker ps -a -q)" ]; then
    docker rm -f $(docker ps -a -q)
fi

docker build -t aiui .
docker run -d -e OPENAI_API_KEY="${OPENAI_API_KEY}" -p 8000:80 aiui
