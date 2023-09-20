import logging
import os
import time
import uuid

import requests
from gtts import gTTS
import edge_tts
from elevenlabs import generate, save

from util import delete_file

LANGUAGE = os.getenv("LANGUAGE", "en")
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "EDGETTS")

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", None)
ELEVENLABS_VOICE = os.getenv("ELEVENLABS_VOICE", "EXAVITQu4vr4xnSDxMaL")
EDGETTS_VOICE = os.getenv("EDGETTS_VOICE", "en-US-EricNeural")


async def to_speech(text, background_tasks):
    if TTS_PROVIDER == "gTTS":
        return _gtts_to_speech(text, background_tasks)
    elif TTS_PROVIDER == "ELEVENLABS":
        return _elevenlabs_to_speech(text, background_tasks)
    elif TTS_PROVIDER == "STREAMELEMENTS":
        return _streamelements_to_speech(text, background_tasks)
    elif TTS_PROVIDER == "EDGETTS":
        return await _edge_tts_to_speech(text, background_tasks)
    else:
        raise ValueError(f"env var TTS_PROVIDER set to unsupported value: {TTS_PROVIDER}")


async def _edge_tts_to_speech(text, background_tasks):
    start_time = time.time()

    communicate = edge_tts.Communicate(text, EDGETTS_VOICE)
    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    await communicate.save(filepath)

    background_tasks.add_task(delete_file, filepath)

    logging.info('TTS time: %s %s', time.time() - start_time, 'seconds')
    return filepath


def _gtts_to_speech(text, background_tasks):
    start_time = time.time()

    tts = gTTS(text, lang=LANGUAGE)
    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    tts.save(filepath)

    background_tasks.add_task(delete_file, filepath)

    logging.info('TTS time: %s %s', time.time() - start_time, 'seconds')
    return filepath


def _elevenlabs_to_speech(text, background_tasks):
    start_time = time.time()

    audio = generate(
        api_key=ELEVENLABS_API_KEY,
        text=text,
        voice=ELEVENLABS_VOICE,
        model="eleven_monolingual_v1"
    )

    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    save(audio, filepath)

    background_tasks.add_task(delete_file, filepath)

    logging.info('TTS time: %s %s', time.time() - start_time, 'seconds')
    return filepath


def _streamelements_to_speech(text, background_tasks):
    start_time = time.time()

    response = requests.get(f"https://api.streamelements.com/kappa/v2/speech?voice=Salli&text={text}")

    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    with open(filepath, "wb") as f:
        f.write(response.content)

    background_tasks.add_task(delete_file, filepath)

    logging.info('TTS time: %s %s', time.time() - start_time, 'seconds')
    return filepath
