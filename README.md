<p align="center">
  <img src="https://github.com/lspahija/AIUI/assets/44912218/4a8537fc-8438-4f27-bdfb-32d4418fb06b" alt="AIUI">
</p>

# A Voice Interface for AI

Point-and-click user interfaces will soon be a thing of the past. The main user interface of the near future will be entirely voice-based.

AIUI is a platform that aims to enable seamless two-way verbal communication with AI models. It works in both desktop and mobile browsers and currently supports GPT-4 and GPT-3.5 models, with support for open models under development.

## Demo Video
https://github.com/lspahija/AIUI/assets/44912218/0c984aed-9785-4dd1-983a-198414e5b573

## Usage
To interact with AIUI, simply start speaking after navigating to the app in your browser. AIUI will listen to your voice input, process it using an AI model, and provide a synthesized speech response. You can have a natural, continuous conversation with the AI by speaking and listening to its responses.

## Run it Locally  
1. Clone the repo
```bash
git clone git@github.com:lspahija/AIUI.git
```
2. Change directory to AIUI
```bash
cd AIUI
```
3. Build Docker image
```bash
docker build -t aiui .
``` 
or if on arm64 architecture (including Apple Silicon): 
```bash
docker buildx build --platform linux/arm64 -t aiui .
```
4. Create Docker container from image
```bash
docker run -d -e OPENAI_API_KEY=<YOUR_API_KEY> -e TTS_PROVIDER=EDGETTS -e EDGETTS_VOICE=en-US-EricNeural -p 8000:80 aiui
```
5. Navigate to `localhost:8000` in a modern browser


## Notes
The AI model defaults to `gpt-3.5-turbo` but you can adjust this by setting the `AI_COMPLETION_MODEL` environment variable (e.g. to `gpt-4` if your `OPENAI_API_KEY` has access to it)

You can configure the language by setting the `LANGUAGE` environment variable to the corresponding ISO-639-1 code. The default is `en`.
Languages other than English are currently only supported when using the `gTTS` or `edge_tts` providers for text-to-speech. The TTS provider can be selected by setting the environment variable `TTS_PROVIDER` to one of the values in [tts.py](./backend/tts.py).

<br/>

## One Click Deployment
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/XxIOWs?referralCode=VcOv5G)


## Find this useful?
Please star this repository! It helps contributors gauge the popularity of the repo and determine how much time to allot to development.
