import os
import time
import uuid

import requests
from gtts import gTTS
from pydub import AudioSegment
import edge_tts

from app.util import delete_file

LANGUAGE = os.getenv("LANGUAGE", "en")
AUDIO_SPEED = os.getenv("AUDIO_SPEED", None)
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "STREAMELEMENTS")

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", None)
ELEVENLABS_VOICE = os.getenv("ELEVENLABS_VOICE", "EXAVITQu4vr4xnSDxMaL")
EDGETTS_VOICE = os.getenv("EDGETTS_VOICE", "en-US-ChristopherNeural")


async def to_speech(text):
    if TTS_PROVIDER == "gTTS":
        return _gtts_to_speech(text)
    elif TTS_PROVIDER == "ELEVENLABS":
        return _elevenlabs_to_speech(text)
    elif TTS_PROVIDER == "STREAMELEMENTS":
        return _streamelements_to_speech(text)
    elif TTS_PROVIDER == "EDGETTS":
        return await _edge_tts_to_speech(text)
    else:
        raise ValueError(f"env var TTS_PROVIDER set to unsupported value: {TTS_PROVIDER}")


async def _edge_tts_to_speech(text):
    start_time = time.time()

    communicate = edge_tts.Communicate(text, EDGETTS_VOICE)
    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    await communicate.save(filepath)

    speed_adjusted_filepath = _adjust_audio_speed(filepath)

    print('TTS time:', time.time() - start_time, 'seconds')
    return speed_adjusted_filepath


def _gtts_to_speech(text):
    start_time = time.time()

    tts = gTTS(text, lang=LANGUAGE)
    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    tts.save(filepath)

    speed_adjusted_filepath = _adjust_audio_speed(filepath)

    print('TTS time:', time.time() - start_time, 'seconds')
    return speed_adjusted_filepath


def _elevenlabs_to_speech(text):
    start_time = time.time()

    response = requests.post(
        url=f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE}",
        headers={
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
        },
        json={"text": text}
    )

    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    with open(filepath, "wb") as f:
        f.write(response.content)

    speed_adjusted_filepath = _adjust_audio_speed(filepath)

    print('TTS time:', time.time() - start_time, 'seconds')
    return speed_adjusted_filepath


def _streamelements_to_speech(text):
    start_time = time.time()

    response = requests.get(f"https://api.streamelements.com/kappa/v2/speech?voice=Salli&text={text}")

    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    with open(filepath, "wb") as f:
        f.write(response.content)

    speed_adjusted_filepath = _adjust_audio_speed(filepath)

    print('TTS time:', time.time() - start_time, 'seconds')
    return speed_adjusted_filepath


def _adjust_audio_speed(audio_filepath):
    if AUDIO_SPEED is None:
        return audio_filepath

    audio = AudioSegment.from_mp3(audio_filepath)
    faster_audio = audio.speedup(playback_speed=float(AUDIO_SPEED))

    speed_adjusted_filepath = f"/tmp/{uuid.uuid4()}.mp3"
    faster_audio.export(speed_adjusted_filepath, format="mp3")

    delete_file(audio_filepath)

    return speed_adjusted_filepath
