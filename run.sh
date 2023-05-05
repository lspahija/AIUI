#!/bin/bash
set -e

if [ "$(docker ps -a -q)" ]; then
    docker rm -f $(docker ps -a -q)
fi

docker build -t aiui .

if [ "$1" == "gTTS" ]; then
    docker run -d -e OPENAI_API_KEY="${OPENAI_API_KEY}" -e TTS_PROVIDER="gTTS" -p 8000:80 aiui
elif [ "$1" == "ELEVENLABS" ]; then
    docker run -d -e OPENAI_API_KEY="${OPENAI_API_KEY}" -e ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY}" -p 8000:80 aiui
else
    echo "Invalid argument. Please provide either 'gTTS' or 'ELEVENLABS'."
    exit 1
fi
