import base64
import json
import time
import logging

from fastapi import FastAPI, UploadFile, BackgroundTasks, Header
from fastapi.responses import FileResponse
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from ai import get_completion
from stt import transcribe
from tts import to_speech

app = FastAPI()
logging.basicConfig(level=logging.INFO)


@app.post("/inference")
async def infer(audio: UploadFile, background_tasks: BackgroundTasks,
                conversation: str = Header(default=None)) -> FileResponse:
    logging.debug("received request")
    start_time = time.time()

    user_prompt_text = await transcribe(audio)
    ai_response_text = await get_completion(user_prompt_text, conversation)
    ai_response_audio_filepath = await to_speech(ai_response_text, background_tasks)

    logging.info('total processing time: %s %s', time.time() - start_time, 'seconds')
    return FileResponse(path=ai_response_audio_filepath, media_type="audio/mpeg",
                        headers={"text": _construct_response_header(user_prompt_text, ai_response_text)})


@app.get("/")
async def root():
    return RedirectResponse(url="/index.html")


app.mount("/", StaticFiles(directory="/app/frontend/dist"), name="static")


def _construct_response_header(user_prompt, ai_response):
    return base64.b64encode(
        json.dumps(
            [{"role": "user", "content": user_prompt}, {"role": "assistant", "content": ai_response}]).encode(
            'utf-8')).decode("utf-8")
