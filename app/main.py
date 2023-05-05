import json
import time
from fastapi import FastAPI, UploadFile, BackgroundTasks, Header
from fastapi.responses import FileResponse
import openai
import shutil
import uuid
from gtts import gTTS
import ffmpeg
import base64
from fastapi.staticfiles import StaticFiles
import os
from pydub import AudioSegment
from fastapi.responses import RedirectResponse
import requests

AI_COMPLETION_MODEL = os.getenv("AI_COMPLETION_MODEL", "gpt-3.5-turbo")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", None)
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "STREAMELEMENTS")
LANGUAGE = os.getenv("LANGUAGE", "en")
AUDIO_SPEED = os.getenv("AUDIO_SPEED", None)
app = FastAPI()


@app.post("/inference")
async def infer(audio: UploadFile, background_tasks: BackgroundTasks,
                conversation: str = Header(default=None)) -> FileResponse:
    print("received request")
    start_time = time.time()

    user_prompt = await transcribe(audio)
    ai_response = await get_completion(user_prompt, conversation)

    output_audio_filepath = to_audio(ai_response)
    background_tasks.add_task(delete_file, output_audio_filepath)

    print('total processing time:', time.time() - start_time, 'seconds')

    return FileResponse(path=output_audio_filepath, media_type="audio/mpeg",
                        headers={"text": construct_response_header(user_prompt, ai_response)})


@app.get("/")
async def root():
    return RedirectResponse(url="/index.html")


app.mount("/", StaticFiles(directory="/app/frontend/dist"), name="static")


async def transcribe(audio):
    start_time = time.time()
    initial_filepath = f"/tmp/{uuid.uuid4()}{audio.filename}"

    with open(initial_filepath, "wb+") as file_object:
        shutil.copyfileobj(audio.file, file_object)

    converted_filepath = f"/tmp/ffmpeg-{uuid.uuid4()}{audio.filename}"

    print("running through ffmpeg")
    (
        ffmpeg
        .input(initial_filepath)
        .output(converted_filepath, loglevel="error")
        .run()
    )
    print("ffmpeg done")

    delete_file(initial_filepath)

    read_file = open(converted_filepath, "rb")

    print("calling whisper")
    transcription = (await openai.Audio.atranscribe("whisper-1", read_file, language=LANGUAGE))["text"]
    print("STT response received from whisper in", time.time() - start_time, 'seconds')
    print('user prompt:', transcription)

    delete_file(converted_filepath)

    return transcription


async def get_completion(user_prompt, conversation_thus_far):
    start_time = time.time()
    messages = [
        {"role": "system",
         "content": f"You are a helpful assistant with a voice interface. Keep your responses succinct since the user is interacting with you through a voice interface. Your responses should be a few sentences at most. Always provide your responses in the language that corresponds to the ISO-639-1 code: {LANGUAGE}."}
    ]
    messages.extend(get_additional_initial_messages())
    messages.extend(json.loads(base64.b64decode(conversation_thus_far)))
    messages.append({"role": "user", "content": user_prompt})

    print("calling", AI_COMPLETION_MODEL)
    res = await openai.ChatCompletion.acreate(model=AI_COMPLETION_MODEL, messages=messages, timeout=15)
    print("response received from", AI_COMPLETION_MODEL, "in", time.time() - start_time, "seconds")

    completion = res['choices'][0]['message']['content']
    print(AI_COMPLETION_MODEL, "response:", completion)

    return completion


def get_additional_initial_messages():
    match AI_COMPLETION_MODEL:
        case "gpt-3.5-turbo":
            return [{"role": "user",
                     "content": f"Make sure you always strictly provide your responses in the language that corresponds to the ISO-639-1 code: {LANGUAGE}."}]
        case _:
            return []


def to_audio(text):
    if TTS_PROVIDER == "gTTS":
        return gtts_to_audio(text)
    elif TTS_PROVIDER == "ELEVENLABS":
        return elevenlabs_to_audio(text)
    elif TTS_PROVIDER == "STREAMELEMENTS":
        return streamelements_to_audio(text)
    else:
        raise ValueError(f"env var TTS_PROVIDER set to unsupported value: {TTS_PROVIDER}")


def gtts_to_audio(text):
    start_time = time.time()

    tts = gTTS(text, lang=LANGUAGE)
    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    tts.save(filepath)

    speed_adjusted_filepath = adjust_audio_speed(filepath)

    print('TTS time:', time.time() - start_time, 'seconds')
    return speed_adjusted_filepath


def elevenlabs_to_audio(text):
    start_time = time.time()

    response = requests.post(
        url="https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
        headers={
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
        },
        json={"text": text}
    )

    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    with open(filepath, "wb") as f:
        f.write(response.content)

    speed_adjusted_filepath = adjust_audio_speed(filepath)

    print('TTS time:', time.time() - start_time, 'seconds')
    return speed_adjusted_filepath


def streamelements_to_audio(text):
    start_time = time.time()

    response = requests.get(f"https://api.streamelements.com/kappa/v2/speech?voice=Brian&text={text}")

    filepath = f"/tmp/{uuid.uuid4()}.mp3"
    with open(filepath, "wb") as f:
        f.write(response.content)

    speed_adjusted_filepath = adjust_audio_speed(filepath)

    print('TTS time:', time.time() - start_time, 'seconds')
    return speed_adjusted_filepath


def adjust_audio_speed(audio_filepath):
    if AUDIO_SPEED is None:
        return audio_filepath

    audio = AudioSegment.from_mp3(audio_filepath)
    faster_audio = audio.speedup(playback_speed=float(AUDIO_SPEED))

    speed_adjusted_filepath = f"/tmp/{uuid.uuid4()}.mp3"
    faster_audio.export(speed_adjusted_filepath, format="mp3")

    delete_file(audio_filepath)

    return speed_adjusted_filepath


def delete_file(filepath: str):
    os.remove(filepath)


def construct_response_header(user_prompt, ai_response):
    return base64.b64encode(
        json.dumps(
            [{"role": "user", "content": user_prompt}, {"role": "assistant", "content": ai_response}]).encode(
            'utf-8')).decode("utf-8")
