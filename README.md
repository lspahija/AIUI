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

The AI model defaults to `gpt-3.5-turbo` but you can adjust this by setting the `AI_COMPLETION_MODEL` environment variable (e.g. to `gpt-4` if your `OPENAI_API_KEY` has access to it)

If you find this project useful, please give it a star.

A demo is currently deployed at https://ultimate-ai-assistant.up.railway.app/  


https://user-images.githubusercontent.com/44912218/227669605-1508a9d4-34ce-455c-a913-f0c9530a9e73.mp4

Output audio speed can be adjusted by setting the `AUDIO_SPEED` environment variable e.g. setting this to 1.5 will be result in audio playing back at 1.5x default speed.

You can configure the language by setting the `LANGUAGE` environment variable to the corresponding ISO-639-1 code. The default is `en`. The supported languages are:

- af: Afrikaans
- ar: Arabic
- bg: Bulgarian
- bn: Bengali
- bs: Bosnian
- ca: Catalan
- cs: Czech
- da: Danish
- de: German
- el: Greek
- en: English
- es: Spanish
- et: Estonian
- fi: Finnish
- fr: French
- gu: Gujarati
- hi: Hindi
- hr: Croatian
- hu: Hungarian
- id: Indonesian
- is: Icelandic
- it: Italian
- iw: Hebrew
- ja: Japanese
- jw: Javanese
- km: Khmer
- kn: Kannada
- ko: Korean
- la: Latin
- lv: Latvian
- ml: Malayalam
- mr: Marathi
- ms: Malay
- my: Myanmar (Burmese)
- ne: Nepali
- nl: Dutch
- no: Norwegian
- pl: Polish
- pt: Portuguese
- ro: Romanian
- ru: Russian
- si: Sinhala
- sk: Slovak
- sq: Albanian
- sr: Serbian
- su: Sundanese
- sv: Swedish
- sw: Swahili
- ta: Tamil
- te: Telugu
- th: Thai
- tl: Filipino
- tr: Turkish
- uk: Ukrainian
- ur: Urdu
- vi: Vietnamese
- zh: Chinese (Mandarin)