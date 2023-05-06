# AIUI: A Natural Language Voice Interface for AI

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/XxIOWs?referralCode=VcOv5G)

Point-and-click user interfaces will soon be a thing of the past. The main user interface of the near future will be entirely voice-based.

AIUI is a platform that aims to enable seamless two-way verbal communication with AI models. It works in both desktop and mobile browsers and currently supports GPT-4 and GPT-3.5 models.

## Usage
To interact with AIUI, simply start speaking after navigating to the [app](https://aiui.up.railway.app/) in your browser. AIUI will listen to your voice input, process it using an AI model, and provide a synthesized speech response. You can have a natural, continuous conversation with the AI by speaking and listening to its responses.

## Run it Locally  
1. `git clone git@github.com:lspahija/AIUI.git`
2. `cd AIUI`
3. `docker build -t aiui .`
4. `docker run -d -e OPENAI_API_KEY='<YOUR_API_KEY>' TTS_PROVIDER='ELEVENLABS' ELEVENLABS_API_KEY='<YOUR_API_KEY>' -p 8000:80 aiui`
5. navigate to `localhost:8000` in a modern browser

The AI model defaults to `gpt-3.5-turbo` but you can adjust this by setting the `AI_COMPLETION_MODEL` environment variable (e.g. to `gpt-4` if your `OPENAI_API_KEY` has access to it)

(this video is currently out of date)

https://user-images.githubusercontent.com/44912218/227669605-1508a9d4-34ce-455c-a913-f0c9530a9e73.mp4

Output audio speed can be adjusted by setting the `AUDIO_SPEED` environment variable e.g. setting this to 1.5 will result in audio playing back at 1.5x default speed.

You can configure the language by setting the `LANGUAGE` environment variable to the corresponding ISO-639-1 code. The default is `en`.
Languages other than English are currently only supported when using the `gTTS` or `edge_tts` providers for text-to-speech. The TTS provider can be selected by setting the environment variable `TTS_PROVIDER` to one of the values in [tts.py](./app/tts.py).

## Contribution
We welcome contributions from the community! If you'd like to contribute, please consider the following:

- Report any issues you encounter
- Suggest new features or improvements
- Submit pull requests for bug fixes or new features 

Don't forget to ⭐️ the repo if you find it useful!