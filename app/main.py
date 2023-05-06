import base64
import json
import time

from fastapi import FastAPI, UploadFile, BackgroundTasks, Header
from fastapi.responses import FileResponse
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.ai import get_completion
from app.stt import transcribe
from app.tts import to_speech
from app.util import delete_file

app = FastAPI()


@app.post("/inference")
async def infer(audio: UploadFile, background_tasks: BackgroundTasks,
                conversation: str = Header(default=None)) -> FileResponse:
    print("received request")
    start_time = time.time()

    user_prompt = await transcribe(audio)
    ai_response = await get_completion(user_prompt, conversation)

    output_audio_filepath = await to_speech(ai_response)
    background_tasks.add_task(delete_file, output_audio_filepath)

    print('total processing time:', time.time() - start_time, 'seconds')

    return FileResponse(path=output_audio_filepath, media_type="audio/mpeg",
                        headers={"text": _construct_response_header(user_prompt, ai_response)})


@app.get("/")
async def root():
    return RedirectResponse(url="/index.html")


app.mount("/", StaticFiles(directory="/app/frontend/dist"), name="static")


def _construct_response_header(user_prompt, ai_response):
    return base64.b64encode(
        json.dumps(
            [{"role": "user", "content": user_prompt}, {"role": "assistant", "content": ai_response}]).encode(
            'utf-8')).decode("utf-8")
