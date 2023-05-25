import base64
import json
import logging
import os
import time
from contextlib import asynccontextmanager
import os

import openai
from fastapi import FastAPI
from huggingface_hub import hf_hub_download
from llama_cpp import Llama

AI_COMPLETION_MODEL = os.getenv("AI_COMPLETION_MODEL", "gpt-3.5-turbo")
LANGUAGE = os.getenv("LANGUAGE", "en")
INITIAL_PROMPT = f"You are AIUI - a helpful assistant with a voice interface. Keep your responses very succinct and limited to a single sentence since the user is interacting with you through a voice interface. Always provide your responses in the language that corresponds to the ISO-639-1 code: {LANGUAGE}."

llm = None


import os

@asynccontextmanager
async def initialize_model(app: FastAPI):
    model_dir = "/app"
    filename = "Wizard-Vicuna-7B-Uncensored.ggmlv3.q4_0.bin"
    model_path = os.path.join(model_dir, filename)

    logging.info(f"Current working directory: {os.getcwd()}")
    logging.info(f"Files in current directory: {os.listdir()}")

    if not os.path.isfile(model_path):
        logging.info(f"downloading {filename}")
        hf_hub_download(repo_id="TheBloke/Wizard-Vicuna-7B-Uncensored-GGML",
                        filename=filename, local_dir=model_dir)
        logging.info(f"done downloading {filename}")
    else:
        logging.info(f"{filename} already exists, skipping download")

    global llm
    logging.info(f"loading {filename}")
    llm = Llama(model_path=model_path)
    logging.info(f"loaded {filename}")
    yield



async def get_completion(user_prompt, conversation_thus_far):
    if _is_empty(user_prompt):
        raise ValueError("empty user prompt received")

    start_time = time.time()
    messages = [
        {
            "role": "system",
            "content": INITIAL_PROMPT
        }
    ]
    messages.extend(_get_additional_initial_messages())
    messages.extend(json.loads(base64.b64decode(conversation_thus_far)))
    messages.append({"role": "user", "content": user_prompt})

    logging.debug("calling %s", AI_COMPLETION_MODEL)
    res = await openai.ChatCompletion.acreate(model=AI_COMPLETION_MODEL, messages=messages, timeout=15)
    logging.info("response received from %s %s %s %s", AI_COMPLETION_MODEL, "in", time.time() - start_time, "seconds")

    completion = res['choices'][0]['message']['content']
    logging.info('%s %s %s', AI_COMPLETION_MODEL, "response:", completion)

    return completion


async def get_local_completion(user_prompt):
    logging.info("calling the local model")
    output = llm(
        f'### Instruction: {INITIAL_PROMPT} ### User: {user_prompt} ### Response:',
        max_tokens=100, echo=True)
    text = output["choices"][0]["text"].split("### Response:")[-1].strip()
    logging.info("done calling the local model")
    return text


def _is_empty(user_prompt: str):
    return not user_prompt or user_prompt.isspace()


def _get_additional_initial_messages():
    match AI_COMPLETION_MODEL:
        case "gpt-3.5-turbo":
            return [
                {
                    "role": "user",
                    "content": INITIAL_PROMPT
                }
            ]
        case _:
            return []
