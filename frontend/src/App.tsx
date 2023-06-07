import {useMicVAD} from "@ricky0123/vad-react";
import {useEffect, useRef, useState} from "react";
import RotateLoader from "react-spinners/RotateLoader";
import {onMisfire, onSpeechEnd, onSpeechStart} from "./SpeechManager.ts";
import {particleActions} from "./ParticleManager.ts";

const useCanvas = (draw) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let animationFrameId;

        const render = () => {
            draw(context, canvas.width, canvas.height, canvas.width / 2, canvas.height / 2);
            animationFrameId = window.requestAnimationFrame(render);
        };

        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        }
    }, [draw]);

    return canvasRef;
}


const useMicVADWrapper = (options, onLoadingChange) => {
    const micVAD = useMicVAD(options);
    const loadingRef = useRef(micVAD.loading);

    useEffect(() => {
        if (loadingRef.current !== micVAD.loading) {
            onLoadingChange(micVAD.loading);
            loadingRef.current = micVAD.loading;
        }
    });

    return micVAD;
}

const App = () => {
    const [loading, setLoading] = useState(true);
    const canvasRef = useCanvas(particleActions.draw);

    useMicVADWrapper({
        preSpeechPadFrames: 5,
        positiveSpeechThreshold: 0.90,
        negativeSpeechThreshold: 0.75,
        minSpeechFrames: 4,
        startOnLoad: true,
        onSpeechStart,
        onSpeechEnd,
        onVADMisfire: onMisfire
    }, setLoading);

    return (
        loading
            ? (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    width: "100vw",
                }}>
                    <RotateLoader
                        loading={loading}
                        color={"#27eab6"}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
            ) : (
                <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}/>
            )
    );
}

export default App;
