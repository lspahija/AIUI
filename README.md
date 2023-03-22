# The Ultimate AI Assistant

Now you can use ChatGPT from anywhere! Talk to ChatGPT when driving in the car. Bounce ideas off the ultimate
personal assistant.

This uses OpenAI Whisper for speech-to-text and OpenAI `gpt-3.5-turbo`/`gpt-4` for completion.

To get it running:
```
(while inside ultimate-ai-assistant project root directory)
docker build -t ultimate_ai_assistant .  
docker run -d -e OPENAI_API_KEY='<YOUR_API_KEY>' -p 8000:80 ultimate_ai_assistant
```

and then navigate to `localhost:8000`

Quick demo video: https://www.loom.com/share/2bd94941b4924d52889a87ed8301201e  
Demo currently deployed at https://ultimate-ai-assistant.up.railway.app/

Star the repo if you like it!