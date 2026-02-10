import React, { useRef, useState, useEffect, useMemo } from 'react';
import AudioWaveform from './AudioWaveform';

// Memoized Ruler Component
const Ruler = React.memo(({ zoom, duration }) => {
    // Generate ticks based on duration (add some buffer)
    const ticks = useMemo(() => Array.from({ length: Math.ceil(duration * 2) }), [duration]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, height: '25px', width: duration * zoom, background: '#111', borderBottom: '1px solid #222' }}>
            {ticks.map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    left: (i * 0.5) * zoom,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    height: i % 2 === 0 ? '25px' : '10px',
                    pointerEvents: 'none'
                }}>
                    {i % 2 === 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            fontSize: '9px',
                            color: '#555',
                            fontWeight: 700
                        }}>{i / 2}s</span>
                    )}
                </div>
            ))}
        </div>
    );
});

const Playhead = React.memo(({ zoom, playheadRef }) => {
    return (
        <div
            ref={playheadRef}
            style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '1px',
                background: '#FF3366',
                zIndex: 100,
                pointerEvents: 'none',
                willChange: 'transform'
            }}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                left: '-3px',
                width: '7px',
                height: '7px',
                background: '#FF3366',
                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'
            }} />
        </div>
    );
});

// Memoized Caption Blocks
const CaptionBlocks = React.memo(({
    captions,
    zoom,
    selectedCaptionIndex,
    onMouseDown,
    onSelect
}) => {
    return (
        <div style={{ position: 'relative', height: '100%', width: '100%', paddingTop: '40px' }}>
            {captions.map((caption, index) => (
                <div
                    key={index}
                    onMouseDown={(e) => onMouseDown(e, index, 'move')}
                    style={{
                        position: 'absolute',
                        left: caption.start * zoom,
                        width: Math.max(2, (caption.end - caption.start) * zoom),
                        top: '45px',
                        border: selectedCaptionIndex === index ? '2px solid #FF6B6B' : (caption.confidence < 0.8 ? '1px dashed #FFA500' : '1px solid #333'),
                        boxShadow: selectedCaptionIndex === index ? '0 0 15px rgba(255,51,102,0.5)' : 'none',
                        zIndex: selectedCaptionIndex === index ? 20 : 10,
                        background: '#1A1A1A',
                        borderRadius: '4px',
                        height: '24px',
                        overflow: 'hidden'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(index);
                    }}
                >
                    <div
                        onMouseDown={(e) => onMouseDown(e, index, 'resize-start')}
                        style={{
                            position: 'absolute',
                            left: 0, top: 0, bottom: 0,
                            width: '6px', cursor: 'ew-resize',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2
                        }}
                    >
                        <div style={{ width: '1px', height: '60%', background: 'rgba(255,255,255,0.2)' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', height: '100%', paddingLeft: '10px' }}>
                        {caption.confidence < 0.8 && <span title="Low confidence transcription" style={{ color: '#FFA500', fontSize: '10px' }}>⚠️</span>}
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#eee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {caption.text}
                        </span>
                    </div>

                    <div
                        onMouseDown={(e) => onMouseDown(e, index, 'resize-end')}
                        style={{
                            position: 'absolute',
                            right: 0, top: 0, bottom: 0,
                            width: '6px', cursor: 'ew-resize',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <div style={{ width: '1px', height: '60%', background: 'rgba(255,255,255,0.2)' }} />
                    </div>
                </div>
            ))}
        </div>
    );
});


const Timeline = React.forwardRef(({
    captions,
    previewTime, // Still used for initial state and manual seeks
    videoUrl,
    onSeek,
    onUpdateCaption,
    onDeleteCaption,
    onSelectCaption,
    selectedCaptionIndex
}, ref) => {
    const containerRef = useRef(null);
    const playheadRef = useRef(null);
    const timeDisplayRef = useRef(null);
    const [zoom, setZoom] = useState(50);
    const [dragging, setDragging] = useState(null);

    const totalDuration = useMemo(() =>
        captions.length > 0 ? captions[captions.length - 1].end + 2 : 10
        , [captions]);

    // Imperative API for smooth updates
    React.useImperativeHandle(ref, () => ({
        setTime: (time) => {
            if (playheadRef.current) {
                playheadRef.current.style.transform = `translateX(${time * zoom}px)`;
            }
            if (timeDisplayRef.current) {
                const mins = Math.floor(time / 60);
                const secs = Math.floor(time % 60);
                const frames = Math.floor((time % 1) * 30);
                timeDisplayRef.current.innerHTML = `${mins}:${secs.toString().padStart(2, '0')}:<span style="color: #FF3366">${frames.toString().padStart(2, '0')}</span>`;
            }
        },
        scrollToTime: (time) => {
            if (containerRef.current) {
                const scrollPos = time * zoom - (containerRef.current.clientWidth / 2);
                containerRef.current.scrollLeft = scrollPos;
            }
        }
    }), [zoom]);

    // Sync initial/seek state
    useEffect(() => {
        if (playheadRef.current) {
            playheadRef.current.style.transform = `translateX(${previewTime * zoom}px)`;
        }
    }, [previewTime, zoom]);

    const handleMouseDown = (e, index, type) => {
        e.stopPropagation();
        onSelectCaption(index);
        setDragging({
            index,
            type,
            startX: e.clientX,
            initialStart: captions[index].start,
            initialEnd: captions[index].end
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!dragging) return;
            const dx = (e.clientX - dragging.startX) / zoom;
            const caption = captions[dragging.index];

            if (dragging.type === 'move') {
                const duration = dragging.initialEnd - dragging.initialStart;
                const newStart = Math.max(0, dragging.initialStart + dx);
                onUpdateCaption(dragging.index, { ...caption, start: newStart, end: newStart + duration });
            } else if (dragging.type === 'resize-end') {
                const newEnd = Math.max(caption.start + 0.1, dragging.initialEnd + dx);
                onUpdateCaption(dragging.index, { ...caption, end: newEnd });
            } else if (dragging.type === 'resize-start') {
                const newStart = Math.min(caption.end - 0.1, Math.max(0, dragging.initialStart + dx));
                onUpdateCaption(dragging.index, { ...caption, start: newStart });
            }
        };

        const handleMouseUp = () => setDragging(null);

        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, zoom, captions, onUpdateCaption]);

    const handleContainerClick = (e) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left + containerRef.current.scrollLeft;
            const seekTime = clickX / zoom;
            onSeek(Math.max(0, seekTime));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#444', textTransform: 'uppercase' }}>Zoom</span>
                    <input
                        type="range"
                        min="20" max="300"
                        value={zoom}
                        onChange={(e) => setZoom(parseInt(e.target.value))}
                        style={{ accentColor: '#FF3366', height: '4px', cursor: 'pointer' }}
                    />
                </div>
                <div ref={timeDisplayRef} style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    0:00:<span style={{ color: '#FF3366' }}>00</span>
                </div>
            </div>

            <div
                ref={containerRef}
                onClick={handleContainerClick}
                style={{
                    position: 'relative',
                    height: '140px',
                    background: '#0A0A0A',
                    border: '1px solid #222',
                    borderRadius: '4px',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    cursor: 'crosshair',
                    userSelect: 'none'
                }}
            >
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0 }}>
                    <AudioWaveform videoUrl={videoUrl} zoom={zoom} duration={totalDuration} />
                </div>

                <Playhead zoom={zoom} playheadRef={playheadRef} />

                <Ruler zoom={zoom} duration={totalDuration} />

                <CaptionBlocks
                    captions={captions}
                    zoom={zoom}
                    selectedCaptionIndex={selectedCaptionIndex}
                    onMouseDown={handleMouseDown}
                    onSelect={onSelectCaption}
                />
            </div>
        </div>
    );
});

export default Timeline;
