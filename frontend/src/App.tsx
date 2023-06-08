import {useMicVADWrapper} from "./hooks/useMicVADWrapper";
import RotateLoader from "react-spinners/RotateLoader";
import {particleActions} from "./particle-manager.ts";
import {useState} from "react";
import Canvas from "./Canvas.tsx";

const App = () => {
    const [loading, setLoading] = useState(true);

    useMicVADWrapper(setLoading);

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

    return <Canvas draw={particleActions.draw}/>
}

export default App;
