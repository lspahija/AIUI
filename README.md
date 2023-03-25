# The Ultimate AI Assistant

Now you can use GPT-3/GPT-4 from anywhere! Talk to GPT-4 when driving in the car. Bounce ideas off the ultimate
personal assistant.

This uses OpenAI Whisper for speech-to-text and OpenAI `gpt-3.5-turbo`/`gpt-4` for completion.

To get it running:  
`cd` into `ultimate-ai-assistant` project root directory
```
docker build -t ultimate_ai_assistant .  
docker run -d -e OPENAI_API_KEY='<YOUR_API_KEY>' -p 8000:80 ultimate_ai_assistant
```

and then navigate to `localhost:8000`

The AI model used to `gpt-3.5-turbo` but you can adjust this by setting the `AI_COMPLETION_MODEL` environment variable (e.g. to `gpt-4` if your `OPENAI_API_KEY` has access to it)

Demo currently deployed at https://ultimate-ai-assistant.up.railway.app/  


https://user-images.githubusercontent.com/44912218/227669605-1508a9d4-34ce-455c-a913-f0c9530a9e73.mp4

