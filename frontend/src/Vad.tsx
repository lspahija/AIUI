import {useMicVAD} from "@ricky0123/vad-react";
import {useEffect, useRef, useState} from "react";
import Canvas from "./Canvas.tsx";
import ClipLoader from "react-spinners/ClipLoader";

const Vad = ({onSpeechStart, onSpeechEnd, onMisfire, draw}) => {
    const [loading, setLoading] = useState(true)

    const onLoadingChange = loading => {
        console.log("onloading change called")
        setLoading(loading)
    }

    useMicVADWrapper({
        preSpeechPadFrames: 5,
        positiveSpeechThreshold: 0.90,
        negativeSpeechThreshold: 0.75,
        minSpeechFrames: 4,
        startOnLoad: true,
        onSpeechStart: async () => onSpeechStart(),
        onSpeechEnd: async audio => onSpeechEnd(audio),
        onVADMisfire: () => onMisfire()
    }, onLoadingChange)

    return loading
        ?
        <ClipLoader
            loading={loading}
            cssOverride={{
                display: "block",
                margin: "0 auto",
                borderColor: "red",
            }}
            size={150}
            color={"#ffffff"}
            aria-label="Loading Spinner"
            data-testid="loader"
        />
        :
        <Canvas draw={draw}/>
}

function useMicVADWrapper(options, onLoadingChange) {
    const micVAD = useMicVAD(options)
    const loadingRef = useRef(micVAD.loading)

    useEffect(() => {
        if (loadingRef.current !== micVAD.loading) {
            loadingRef.current = micVAD.loading
            onLoadingChange(micVAD.loading)
        }
    });

    return micVAD
}


export default Vad