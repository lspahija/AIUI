import {useMicVAD, utils} from "@ricky0123/vad-react"
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {useEffect} from 'react';

function App() {
    const vad = useMicVAD({
        startOnLoad: true,
        onSpeechStart: async () => {
            console.log("speech started")
            await playSilence()
        },
        onSpeechEnd: async audio => {
            console.log("speech ended")
            const wavBuffer = utils.encodeWAV(audio)
            const audioBlob = new Blob([wavBuffer], {type: 'audio/wav'});
            await sendData(audioBlob)
        },
    })

    const audio = new Audio()
    const conversationThusFar = []
    let silenceAudioBlob: Blob

    useEffect(() => {
        fetchSilence();
    }, [])

    //https://stackoverflow.com/a/57547943
    const playSilence = async () => {
        if (silenceAudioBlob) audio.src = URL.createObjectURL(silenceAudioBlob)
        else audio.src = "http://localhost:8000/silence.mp3"

        await audio.play()
    }

    const sendData = async data => {
        await validate(data)

        console.log("sending data")
        fetch("http://localhost:8000/inference", {
            method: "POST",
            body: createBody(data),
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
            const response = await fetch("http://localhost:8000/silence.mp3")
            silenceAudioBlob = await response.blob()
        } catch (error) {
            console.error("Error fetching silence.mp3:", error)
        }
    }

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={vad.toggle}>
                    toggle VAD
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
