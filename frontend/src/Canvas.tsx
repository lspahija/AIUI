import {useEffect, useRef} from "react";

const Canvas = props => {
    const {draw, ...rest} = props;
    const canvasRef = useCanvas(draw);

    return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} {...rest}/>
}

const useCanvas = draw => {

    const canvasRef = useRef(null)

    useEffect(() => {

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        const displayWidth = canvas.width
        const displayHeight = canvas.height

        // projection center coordinates sets location of origin
        const projCenterX = displayWidth / 2
        const projCenterY = displayHeight / 2

        let animationFrameId

        const render = () => {
            draw(context, displayWidth, displayHeight, projCenterX, projCenterY)
            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw])

    return canvasRef
}

export default Canvas