import logging
import os
import shutil
import time
import uuid

import ffmpeg
import openai
from whispercpp import Whisper

from util import delete_file

LANGUAGE = os.getenv("LANGUAGE", "en")

# w = None
w = Whisper.from_pretrained("/Users/luka/PyCharmProjects/AIUI/backend/ggml-small.en-q4_1.bin")


async def transcribe(audio):
    start_time = time.time()
    initial_filepath = f"/tmp/{uuid.uuid4()}{audio.filename}"

    with open(initial_filepath, "wb+") as file_object:
        shutil.copyfileobj(audio.file, file_object)

    converted_filepath = f"/tmp/ffmpeg-{uuid.uuid4()}{audio.filename}"

    logging.debug("running through ffmpeg")
    (
        ffmpeg
        .input(initial_filepath)
        .output(converted_filepath, loglevel="error")
        .run()
    )
    logging.debug("ffmpeg done")

    delete_file(initial_filepath)

    # read_file = open(converted_filepath, "rb")

    logging.debug("calling whisper")
    # transcription = (await openai.Audio.atranscribe("whisper-1", read_file, language=LANGUAGE))["text"]
    # os.system(
    #     f'/Users/luka/Projects/whisper.cpp/main "{converted_filepath}" -t 4 -m /Users/luka/Projects/whisper.cpp/models/{whisper_model} -otxt -of ./output')
    # with open("./output.txt", "r") as transcription_file:
    #     transcription = transcription_file.read().strip()

    transcription = w.transcribe_from_file(converted_filepath)

    logging.info("STT response received from whisper in %s %s", time.time() - start_time, 'seconds')
    logging.info('user prompt: %s', transcription)

    delete_file(converted_filepath)
    # delete_file("./output.txt")

    return transcription
