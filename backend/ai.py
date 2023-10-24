import base64
import json
import logging
import os
import time

import openai
import aiohttp

AI_COMPLETION_MODEL = os.getenv("AI_COMPLETION_MODEL", "gpt-3.5-turbo")
LANGUAGE = os.getenv("LANGUAGE", "en")
INITIAL_PROMPT = f"You are AIUI - a helpful assistant with a voice interface. Keep your responses very succinct and limited to a single sentence since the user is interacting with you through a voice interface. Always provide your responses in the language that corresponds to the ISO-639-1 code: {LANGUAGE}."


async def get_completion(user_prompt, conversation_thus_far):
    if _is_empty(user_prompt):
        raise ValueError("empty user prompt received")

    print("getting completion")
    if AI_COMPLETION_MODEL == "mistral":
        return await get_ollama_completion(user_prompt, conversation_thus_far)
    return await get_openai_completion(user_prompt, conversation_thus_far)


async def get_ollama_completion(user_prompt, conversation_thus_far):
    print("getting completion from mistral")
    start_time = time.time()
    url = "http://localhost:11434/api/generate"
    # url = "http://host.docker.internal:11434/api/generate"
    payload = {
        "model": "mistral",
        "prompt": f"{user_prompt} Keep your response very short because you are behind a voice interface."
    }

    # Sending an asynchronous post request
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as resp:
            if resp.status == 200:
                # Handling and accumulating responses
                response_text = await resp.text()
                response_parts = response_text.strip().split("\n")
                completion_parts = [json.loads(part)["response"] for part in response_parts if not json.loads(part)["done"]]
                response = "".join(completion_parts)
                logging.info('%s %s %s', AI_COMPLETION_MODEL, "response:", response)
                logging.info("response received from %s %s %s %s", AI_COMPLETION_MODEL, "in", time.time() - start_time,
                             "seconds")
                return response
            else:
                # Handle possible errors
                error_message = await resp.text()
                logging.error(f"Error from Ollama API: {error_message}")
                raise ValueError(f"Error from Ollama API: {error_message}")


async def get_openai_completion(user_prompt, conversation_thus_far):
    print("getting completion from openai")
    start_time = time.time()
    messages = [
        {
            "role": "system",
            "content": INITIAL_PROMPT
        }
    ]
    messages.extend(json.loads(base64.b64decode(conversation_thus_far)))
    messages.append({"role": "user", "content": user_prompt})

    logging.debug("calling %s", AI_COMPLETION_MODEL)
    res = await openai.ChatCompletion.acreate(model=AI_COMPLETION_MODEL, messages=messages, timeout=15)
    logging.info("response received from %s %s %s %s", AI_COMPLETION_MODEL, "in", time.time() - start_time, "seconds")

    completion = res['choices'][0]['message']['content']
    logging.info('%s %s %s', AI_COMPLETION_MODEL, "response:", completion)

    return completion


def _is_empty(user_prompt: str):
    return not user_prompt or user_prompt.isspace()
