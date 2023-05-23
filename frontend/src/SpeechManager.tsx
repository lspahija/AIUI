import {utils} from "@ricky0123/vad-react"
import Orb from "./Orb.tsx";

const SpeechManager = ({onUserSpeaking, onProcessing, onAISpeaking, reset, draw}) => {
    let source: AudioBufferSourceNode
    const conversationThusFar = []

    const onSpeechStart = () => {
        console.log("speech started")
        onUserSpeaking()
        if (source) source.stop(0)
    }

    const onSpeechEnd = async audio => {
        console.log("speech ended")
        await processAudio(audio)
    }

    const onMisfire = () => {
        console.log("vad misfire")
        reset()
    }

    const processAudio = async audio => {
        onProcessing()

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
        return btoa(String.fromCharCode(...new Uint8Array(data)))
    }

    function base64Decode(base64: string) {
        const binaryStr = atob(base64)
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

        if (source) source.stop(0)
        source = audioContext.createBufferSource()
        source.buffer = await audioContext.decodeAudioData(await blob.arrayBuffer())
        source.connect(audioContext.destination)
        source.start(0)
        source.onended = reset

        onAISpeaking()
    }

    const handleError = error => {
        console.log(`error encountered: ${error.message}`)
        reset()
    }

    const validate = async data => {
        const decodedData = await new AudioContext().decodeAudioData(await data.arrayBuffer())
        const duration = decodedData.duration
        const minDuration = 0.4

        if (duration < minDuration) throw new Error(`Duration is ${duration}s, which is less than minimum of ${minDuration}s`)
    }

    return <Orb onSpeechStart={onSpeechStart} onSpeechEnd={onSpeechEnd} onMisfire={onMisfire} draw={draw}/>
}

export default SpeechManager
