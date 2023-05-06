import base64
import json
import os
import time

import openai

AI_COMPLETION_MODEL = os.getenv("AI_COMPLETION_MODEL", "gpt-3.5-turbo")
LANGUAGE = os.getenv("LANGUAGE", "en")


async def get_completion(user_prompt, conversation_thus_far):
    start_time = time.time()
    messages = [
        {"role": "system",
         "content": f"You are a helpful assistant with a voice interface. Keep your responses succinct since the user is interacting with you through a voice interface. Your responses should be a few sentences at most. Always provide your responses in the language that corresponds to the ISO-639-1 code: {LANGUAGE}."}
    ]
    messages.extend(_get_additional_initial_messages())
    messages.extend(json.loads(base64.b64decode(conversation_thus_far)))
    messages.append({"role": "user", "content": user_prompt})

    print("calling", AI_COMPLETION_MODEL)
    res = await openai.ChatCompletion.acreate(model=AI_COMPLETION_MODEL, messages=messages, timeout=15)
    print("response received from", AI_COMPLETION_MODEL, "in", time.time() - start_time, "seconds")

    completion = res['choices'][0]['message']['content']
    print(AI_COMPLETION_MODEL, "response:", completion)

    return completion


def _get_additional_initial_messages():
    match AI_COMPLETION_MODEL:
        case "gpt-3.5-turbo":
            return [{"role": "user",
                     "content": f"Make sure you always strictly provide your responses in the language that corresponds to the ISO-639-1 code: {LANGUAGE}."}]
        case _:
            return []
