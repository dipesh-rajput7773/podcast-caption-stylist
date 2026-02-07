import React, { useEffect, useRef, useState } from 'react';

const AudioWaveform = ({ videoUrl, zoom, duration }) => {
    const canvasRef = useRef(null);
    const [audioData, setAudioData] = useState(null);

    useEffect(() => {
        if (!videoUrl) return;

        const extractAudio = async () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const response = await fetch(videoUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // Downsample for rendering
                const channelData = audioBuffer.getChannelData(0);
                const step = Math.ceil(channelData.length / 2000); // 2000 points
                const points = [];
                for (let i = 0; i < channelData.length; i += step) {
                    points.push(channelData[i]);
                }
                setAudioData(points);
            } catch (err) {
                console.error("Waveform extraction failed:", err);
            }
        };

        extractAudio();
    }, [videoUrl]);

    useEffect(() => {
        if (!audioData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = duration * zoom;
        const height = canvas.height;

        canvas.width = width;
        ctx.clearRect(0, 0, width, height);

        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;

        const step = width / audioData.length;
        for (let i = 0; i < audioData.length; i++) {
            const x = i * step;
            const y = (0.5 + audioData[i] * 0.5) * height;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }, [audioData, zoom, duration]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: duration * zoom,
                pointerEvents: 'none',
                zIndex: 5
            }}
            height={100}
        />
    );
};

export default AudioWaveform;
