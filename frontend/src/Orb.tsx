import {useMicVAD} from "@ricky0123/vad-react";
import {useEffect, useRef, useState} from "react";
import Canvas from "./Canvas.tsx";
import ClipLoader from "react-spinners/ClipLoader";

const Orb = ({onSpeechStart, onSpeechEnd, onMisfire, draw}) => {
    const [loading, setLoading] = useState(true)

    useMicVADWrapper({
        preSpeechPadFrames: 5,
        positiveSpeechThreshold: 0.90,
        negativeSpeechThreshold: 0.75,
        minSpeechFrames: 4,
        startOnLoad: true,
        onSpeechStart: async () => onSpeechStart(),
        onSpeechEnd: async audio => onSpeechEnd(audio),
        onVADMisfire: () => onMisfire()
    }, loading => setLoading(loading))

    return (
        loading
            ?
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh", // Adjust this to the height you want
                width: "100vw", // Adjust this to the width you want
            }}>
                <ClipLoader
                    loading={loading}
                    cssOverride={{
                        borderColor: "blue",
                    }}
                    size={150}
                    color={"#ffffff"}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
            :
            <Canvas draw={draw}/>
    );
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


export default Orb