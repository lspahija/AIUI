import {useMicVAD, utils} from "@ricky0123/vad-react"
import './App.css'
import {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMicrophone} from '@fortawesome/free-solid-svg-icons';

function App() {
    let source: AudioBufferSourceNode

    const vad = useMicVAD({
        positiveSpeechThreshold: 0.90,
        negativeSpeechThreshold: 0.75,
        minSpeechFrames: 4,
        startOnLoad: true,
        onSpeechStart: async () => {
            console.log("speech started")
            setSpeaking(true)
            if (source) source.stop(0)
        },
        onSpeechEnd: async audio => {
            console.log("speech ended")
            setSpeaking(false)
            await processAudio(audio)
        },
        onVADMisfire: () => {
            console.log("vad misfire")
            setSpeaking(false)
        }
    })

    const conversationThusFar = []

    const [speaking, setSpeaking] = useState(false)
    const [processingAudio, setProcessingAudio] = useState(false)
    const [error, setError] = useState("")

    const processAudio = async audio => {
        setProcessingAudio(true)

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
        if (!res.ok) return Promise.reject(res)

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
        source = audioContext.createBufferSource()
        source.buffer = await audioContext.decodeAudioData(await blob.arrayBuffer())
        source.connect(audioContext.destination)
        source.start(0);

        setProcessingAudio(false)
    }

    const handleError = error => {
        console.log(`error encountered: ${error}`)

        setProcessingAudio(false)

        setError(`Error occurred: ${error}`)
        setTimeout(() => setError(""), 2000)
    }

    const validate = async data => {
        const decodedData = await new AudioContext().decodeAudioData(await data.arrayBuffer())
        const duration = decodedData.duration
        const minDuration = 0.4

        if (duration < minDuration) throw new Error(`Duration is ${duration}s, which is less than minimum of ${minDuration}s`)
    }

    return (
        <>
            <div className={`card${speaking ? " speaking" : ""}`}>
                {
                    processingAudio || vad.loading
                        ?
                        <div className="spinner"></div>
                        :
                        <div className="icon-container">
                            <FontAwesomeIcon className="speaker-icon" icon={faMicrophone}/>
                        </div>
                }
                <div className="error-message">{error}</div>
            </div>
        </>
    );

}

export default App
