import {useMicVAD, utils} from "@ricky0123/vad-react"
import './App.css'
import {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMicrophone} from '@fortawesome/free-solid-svg-icons';

const backendHost = "http://localhost:8000"

function App() {
    useMicVAD({
        startOnLoad: true,
        onSpeechStart: async () => {
            console.log("speech started")
            setSpeaking(true)
            await playSilence()
        },
        onSpeechEnd: async audio => {
            console.log("speech ended")
            setSpeaking(false)
            await sendForInference(audio)
        },
    })

    const audio = new Audio()
    const conversationThusFar = []
    let silenceAudioBlob: Blob

    const [speaking, setSpeaking] = useState(false)

    useEffect(() => {
        fetchSilence();
    }, [])

    //https://stackoverflow.com/a/57547943
    const playSilence = async () => {
        if (silenceAudioBlob) audio.src = URL.createObjectURL(silenceAudioBlob)
        else audio.src = `${backendHost}/silence.mp3`

        await audio.play()
    }

    const sendForInference = async audio => {
        const wavBuffer = utils.encodeWAV(audio)
        const blob = new Blob([wavBuffer], {type: 'audio/wav'});
        await validate(blob)

        console.log("sending data")
        fetch(`${backendHost}/inference`, {
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
        audio.src = URL.createObjectURL(blob)
        await audio.play()
    }

    const handleError = error => {
        console.log(`error encountered: ${error}`)
    }

    const validate = async data => {
        const decodedData = await new AudioContext().decodeAudioData(await data.arrayBuffer())
        const duration = decodedData.duration
        const minDuration = 0.4

        if (duration < minDuration) throw new Error(`Duration is ${duration}s, which is less than minimum of ${minDuration}s`)
    }

    const fetchSilence = async () => {
        try {
            console.log("fetching silence")
            const response = await fetch(`${backendHost}/silence.mp3`)
            silenceAudioBlob = await response.blob()
        } catch (error) {
            console.error("Error fetching silence.mp3:", error)
        }
    }

    return (
        <>
            <div className={`card${speaking ? " speaking" : ""}`}>
                <div className="icon-container">
                    <FontAwesomeIcon className="speaker-icon" icon={faMicrophone}/>
                </div>
            </div>
        </>
    );

}

export default App
