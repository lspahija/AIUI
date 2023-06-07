import {utils} from "@ricky0123/vad-react";
import {particleActions} from "./ParticleManager.ts";

let source: AudioBufferSourceNode
let sourceIsStarted = false
const conversationThusFar = []

export const onSpeechStart = () => {
    console.log("speech started")
    particleActions.onUserSpeaking()
    if (source && sourceIsStarted) {
        source.stop(0)
        sourceIsStarted = false
    }
}

export const onSpeechEnd = async audio => {
    console.log("speech ended")
    await processAudio(audio)
}

export const onMisfire = () => {
    console.log("vad misfire")
    particleActions.reset()
}

const processAudio = async audio => {
    particleActions.onProcessing()

    const wavBuffer = utils.encodeWAV(audio)
    const blob = new Blob([wavBuffer], {type: 'audio/wav'});
    await validate(blob)

    console.log("sending data")
    fetch("inference", {
        method: "POST",
        body: createBody(blob),
        headers: {
            'conversation': base64Encode(JSON.stringify(conversationThusFar))
        }
    })
        .then(handleResponse)
        .then(handleSuccess)
        .catch(handleError)
}

function base64Encode(str: string) {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    return window.btoa(String.fromCharCode(...new Uint8Array(data)))
}

function base64Decode(base64: string) {
    const binaryStr = window.atob(base64)
    const bytes = new Uint8Array([...binaryStr].map((char) => char.charCodeAt(0)))
    return new TextDecoder().decode(bytes)
}

const handleResponse = res => {
    if (!res.ok) {
        return res.text().then(error => {
            throw new Error(error);
        });
    }

    const newMessages = JSON.parse(base64Decode(res.headers.get("text")))
    conversationThusFar.push(...newMessages)
    return res.blob()
}

const createBody = data => {
    const formData = new FormData()
    formData.append("audio", data, "audio.wav")
    return formData
}

const handleSuccess = async blob => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()

    if (source && sourceIsStarted) {
        source.stop(0)
        sourceIsStarted = false
    }
    source = audioContext.createBufferSource()
    source.buffer = await audioContext.decodeAudioData(await blob.arrayBuffer())
    source.connect(audioContext.destination)
    source.start(0)
    sourceIsStarted = true
    source.onended = particleActions.reset

    particleActions.onAiSpeaking()
}

const handleError = error => {
    console.log(`error encountered: ${error.message}`)
    particleActions.reset()
}

const validate = async data => {
    const decodedData = await new AudioContext().decodeAudioData(await data.arrayBuffer())
    const duration = decodedData.duration
    const minDuration = 0.4

    if (duration < minDuration) throw new Error(`Duration is ${duration}s, which is less than minimum of ${minDuration}s`)
}
