#!/bin/bash
set -e

CONTAINER_LABEL="created_by=aiui_script"

TTS_OPTIONS=("gTTS" "ELEVENLABS" "STREAMELEMENTS" "EDGETTS")

check_env_var() {
    if [[ -z "${!1}" ]]; then
        echo "Error: $1 is not set."
        exit 1
    fi
}

remove_containers() {
    if [ "$(docker ps -a -q -f "label=$1")" ]; then
        docker rm -f $(docker ps -a -q -f "label=$1")
    fi
}

build_docker() {
    ARCH=$(uname -m)
    if [ "$ARCH" == "arm64" ]; then
        docker buildx build --platform linux/arm64 -t aiui .
    else
        docker build -t aiui .
    fi
}

run_docker() {
    if [ "$1" == "gTTS" ]; then
        docker run -d -e AI_COMPLETION_MODEL=${AI_COMPLETION_MODEL} -e OPENAI_API_KEY=${OPENAI_API_KEY} -e TTS_PROVIDER=gTTS -p 8000:80 --label "$CONTAINER_LABEL" aiui
    elif [ "$1" == "ELEVENLABS" ]; then
        check_env_var "ELEVENLABS_API_KEY"
        docker run -d -e AI_COMPLETION_MODEL=${AI_COMPLETION_MODEL} -e OPENAI_API_KEY=${OPENAI_API_KEY} -e TTS_PROVIDER=ELEVENLABS -e ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY} -e ELEVENLABS_VOICE=EXAVITQu4vr4xnSDxMaL -p 8000:80 --label "$CONTAINER_LABEL" aiui
    elif [ "$1" == "STREAMELEMENTS" ]; then
        docker run -d -e AI_COMPLETION_MODEL=${AI_COMPLETION_MODEL} -e OPENAI_API_KEY=${OPENAI_API_KEY} -e TTS_PROVIDER=STREAMELEMENTS -p 8000:80 --label "$CONTAINER_LABEL" aiui
    elif [ "$1" == "EDGETTS" ]; then
        docker run -d -e AI_COMPLETION_MODEL=${AI_COMPLETION_MODEL} -e OPENAI_API_KEY=${OPENAI_API_KEY} -e TTS_PROVIDER=EDGETTS -e EDGETTS_VOICE=en-US-EricNeural -p 8000:80 --label "$CONTAINER_LABEL" aiui
    else
        echo "Invalid argument. Please provide one of the following:"
        for i in "${TTS_OPTIONS[@]}"
        do
            echo "$i"
        done
        exit 1
    fi
}

check_env_var "OPENAI_API_KEY"
remove_containers "$CONTAINER_LABEL"
build_docker
run_docker "$1"
