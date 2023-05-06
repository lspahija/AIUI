import os
import shutil
import time
import uuid

import ffmpeg
import openai

from app.util import delete_file

LANGUAGE = os.getenv("LANGUAGE", "en")


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
