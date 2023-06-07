import {useEffect, useRef} from "react";

export const useCanvas = (draw) => {
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
