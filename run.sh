#!/bin/bash
set -e

CONTAINER_LABEL="created_by=aiui_script"

# Remove containers with the specified label
if [ "$(docker ps -a -q -f "label=$CONTAINER_LABEL")" ]; then
    docker rm -f $(docker ps -a -q -f "label=$CONTAINER_LABEL")
fi

docker build -t aiui .

if [ "$1" == "gTTS" ]; then
    docker run -d -e OPENAI_API_KEY="${OPENAI_API_KEY}" -e TTS_PROVIDER="gTTS" -p 8000:80 --label "$CONTAINER_LABEL" aiui
elif [ "$1" == "ELEVENLABS" ]; then
    docker run -d -e OPENAI_API_KEY="${OPENAI_API_KEY}" -e TTS_PROVIDER="ELEVENLABS" -e ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY}" -e ELEVENLABS_VOICE="EXAVITQu4vr4xnSDxMaL" -p 8000:80 --label "$CONTAINER_LABEL" aiui
elif [ "$1" == "STREAMELEMENTS" ]; then
    docker run -d -e OPENAI_API_KEY="${OPENAI_API_KEY}" -e TTS_PROVIDER="STREAMELEMENTS" -p 8000:80 --label "$CONTAINER_LABEL" aiui
elif [ "$1" == "EDGETTS" ]; then
    docker run -d -e OPENAI_API_KEY="${OPENAI_API_KEY}" -e TTS_PROVIDER="EDGETTS" -e EDGETTS_VOICE="en-US-ChristopherNeural" -p 8000:80 --label "$CONTAINER_LABEL" aiui
else
    echo "Invalid argument. Please provide either 'gTTS', 'ELEVENLABS' or 'STREAMELEMENTS'."
    exit 1
fi
