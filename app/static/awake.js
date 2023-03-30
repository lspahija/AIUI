var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var phrase = 'hey wake up';
let transcript = ''
let wakeWordFound = false
const audio = new Audio()
const conversationThusFar = []

function base64Encode(str) {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    return btoa(String.fromCharCode(...new Uint8Array(data)))
}

function base64Decode(base64) {
    const binaryStr = atob(base64)
    const bytes = new Uint8Array([...binaryStr].map((char) => char.charCodeAt(0)))
    return new TextDecoder().decode(bytes)
}

const handleResponse = res => {
    if (!res.ok) return Promise.reject(res)
    let newMessages = JSON.parse(base64Decode(res.headers.get("text")))
    conversationThusFar.push(...newMessages)
    return res.blob()
}

const handleSuccess = async blob => {
    audio.src = URL.createObjectURL(blob)
    await audio.play()
    wakeWordFound = false
    transcript = ''
    document.getElementById("record-button").style.backgroundColor = 'blue'
}

const postQuestion = (speechResult) => {
    document.getElementById("record-button").style.backgroundColor = 'red'
    fetch("inference", {
      method: "POST",
      body: JSON.stringify({text: speechResult}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'conversation': base64Encode(JSON.stringify(conversationThusFar))
      },
    }).then(handleResponse)
      .then(handleSuccess)
}

function listen() {
  document.getElementById("record-button").style.backgroundColor = 'blue'
  phrase = phrase.toLowerCase();
  var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrase +';';
  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  recognition.onresult = function(event) {
    var speechResult = event.results[0][0].transcript.toLowerCase();
    if(speechResult === phrase) {
      wakeWordFound = true
      document.getElementById("record-button").style.backgroundColor = 'green'
      return
    }
    if (!wakeWordFound) return
    postQuestion(speechResult)
  }

  recognition.onend = function(event) {
    recognition.start();
  }
}

window.onload = () => {
  const recordButton = document.getElementById("record-button")
  recordButton.addEventListener("click", listen)
}
