const audio = new Audio()
let mediaRecorder
const conversationThusFar = []
let silenceAudioBlob

const startRecording = async () => {
    await playSilence()

    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        console.log("starting recording")
        mediaRecorder = new MediaRecorder(stream)
        mediaRecorder.ondataavailable = event => sendData(event.data)
        mediaRecorder.start()
    })
}

//https://stackoverflow.com/a/57547943
const playSilence = async () => {
    if (silenceAudioBlob) audio.src = URL.createObjectURL(silenceAudioBlob)
    else audio.src = "/silence.mp3"

    await audio.play()
}

const sendData = async data => {
    await validate(data)

    displaySpinner()

    console.log("sending data")
    fetch("inference", {
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

const createBody = data => {
    const formData = new FormData()
    formData.append("audio", new Blob([data], {type: getMimeType()}), getFileName())
    return formData
}

const getMimeType = () => {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        return 'audio/webm;codecs=opus'
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        return 'audio/ogg;codecs=opus'
    } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=mp4a')) {
        return 'video/mp4;codecs=mp4a'
    } else throw new Error("No supported audio Mime types in this browser")
}

const handleSuccess = async blob => {
    audio.src = URL.createObjectURL(blob)
    await audio.play()
    resetUI()
}

const handleError = res => {
    console.log(`error encountered - status code: ${res.status}`)
    resetUI()
    showErrorMessage()
}

const displaySpinner = () => {
    document.getElementById("spinner").style.display = "block"
    document.getElementById("record-button").style.display = "none"
}

const resetUI = () => {
    document.getElementById("spinner").style.display = "none"
    document.getElementById("record-button").style.display = "block"
}

const showErrorMessage = () => {
    let errorMessage = document.getElementById('error-message')
    errorMessage.style.display = "block"
    setTimeout(() => errorMessage.style.display = "none", 2000)
}

const validate = async data => {
    const decodedData = await new AudioContext().decodeAudioData(await data.arrayBuffer())
    const duration = decodedData.duration
    const minDuration = 0.4

    if (duration < minDuration) throw new Error(`Duration is ${duration}s, which is less than minimum of ${minDuration}s`)
}

const getFileName = () => {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        return 'audio.webm'
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        return 'audio.ogg'
    } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=mp4a')) {
        return 'audio.mp4'
    } else throw new Error("No supported audio Mime types in this browser")
}

const stopRecording = () => {
    mediaRecorder?.stop()
    console.log("stopped recording")
}

const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(100)
}

const fetchSilence = async () => {
    try {
        const response = await fetch("/silence.mp3")
        silenceAudioBlob = await response.blob()
    } catch (error) {
        console.error("Error fetching silence.mp3:", error)
    }
}

const prepare = async () => {
    await fetchSilence()

    const recordButton = document.getElementById("record-button")

    recordButton.addEventListener("mousedown", startRecording)
    recordButton.addEventListener("mouseup", stopRecording)
    recordButton.addEventListener("touchstart", startRecording)
    recordButton.addEventListener("touchend", stopRecording)
    recordButton.addEventListener("touchcancel", stopRecording)
    recordButton.addEventListener('touchstart', vibrate)
}

window.onload = prepare
