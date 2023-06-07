import {useCanvas} from "./hooks/useCanvas";
import {useMicVADWrapper} from "./hooks/useMicVADWrapper";
import RotateLoader from "react-spinners/RotateLoader";
import {VAD_OPTIONS} from "./constants";
import {particleActions} from "./ParticleManager.ts";
import {useState} from "react";

const App = () => {
    const canvasRef = useCanvas(particleActions.draw);
    const [loading, setLoading] = useState(true);

    useMicVADWrapper(VAD_OPTIONS, setLoading);

    if (loading) {
        return (
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
        );
    }

    return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}/>;
}

export default App;
