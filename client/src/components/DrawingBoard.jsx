import { useEffect, useRef, useState } from "react";
import socket from '../socket';

const DrawingBoard = ({roomId})=>{
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(()=>{
        const canvas = canvasRef.current;
        canvas.width = 800
        canvas.height = 600
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineWidth = 4
        ctx.strokeStyle = '#000'
        ctxRef.current = ctx;

        //socket listener for drawing
        socket.on('drawing_data',({x,y,type})=>{
            if(type === 'begin'){
                ctx.beginPath();
                ctx.moveTo(x,y);
            }
            else if(type === 'draw'){
                ctx.lineTo(x,y);
                ctx.stroke();
            }
        })
        return () => {
            socket.off('drawing_data');
        }
    }, [])

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
            }
    }
    const startDrawing = (e) => {
        setIsDrawing(true);
        const {x, y} = getPos(e);
        ctxRef.current.beginPath()
        ctxRef.current.moveTo(x, y);
        socket.emit('drawing_data',{roomId, x,y,type:'begin'});
    }

    const draw = (e) => {
        if(!isDrawing) return
        const {x, y} = getPos(e);
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
        socket.emit('drawing_data',{roomId, x,y,type:'draw'});
    }

    const stopDrawing = () => {
        setIsDrawing(false);
        ctxRef.current.closePath()
    }

    return(
        <canvas 
            ref={canvasRef}
            className="border rounded bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
        />
    )
}

export default DrawingBoard