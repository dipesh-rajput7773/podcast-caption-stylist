import React, { useRef, useEffect, useMemo, useState } from 'react';
import { CAPTION_STYLES } from '../constants/styles';
import PlaybackControls from './PlaybackControls';

// Memoized Video Player to prevent re-renders when only time changes
const VideoPlayer = React.memo(({ videoUrl, isPlaying, onTimeUpdate, onEnded, aspectRatio, currentTime }) => {
    const videoRef = useRef(null);

    // Sync play/pause
    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(e => console.error("Play failed", e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Sync time (for seeking)
    useEffect(() => {
        if (videoRef.current) {
            const diff = Math.abs(videoRef.current.currentTime - currentTime);
            if (diff > 0.5) { // Only seek if difference is significant (prevent fighting)
                videoRef.current.currentTime = currentTime;
            }
        }
    }, [currentTime]);

    return (
        videoUrl ? (
            <video
                ref={videoRef}
                src={videoUrl}
                muted
                playsInline
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // Changed to cover for proper cropping
                    zIndex: 1,
                    backgroundColor: '#000'
                }}
            />
        ) : null
    );
});

// Memoized Caption Overlay
const CaptionOverlay = React.memo(({
    caption,
    style: currentStyle,
    previewTime,
    offset,
    override,
    onMouseDown,
    index,
    scale // Scale factor effectively
}) => {
    if (!caption) return null;

    // Adjust font size based on scale to keep it looking right relative to video
    // But usually CSS handling of container size handles this if using %, but we are using px.
    // We might need to rely on the transform scale of the container.

    const containerStyle = useMemo(() => ({
        fontFamily: override.font || currentStyle.fontFamily,
        fontSize: override.fontSize ? `${override.fontSize}px` : currentStyle.fontSize,
        fontWeight: currentStyle.fontWeight,
        fontStyle: currentStyle.fontStyle || 'normal',
        textTransform: currentStyle.textTransform,
        letterSpacing: currentStyle.letterSpacing,
        color: override.color || currentStyle.textColor,
        textShadow: currentStyle.textShadow,
        textAlign: 'center',
        padding: '20px',
        lineHeight: currentStyle.lineHeight || 1.3,
        display: 'flex',
        flexDirection: 'column',
        gap: currentStyle.layout === 'stacked' ? '12px' : '0',
        cursor: 'grab',
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        userSelect: 'none',
        width: 'fit-content',
        minWidth: '200px',
        maxWidth: '100%',
        whiteSpace: 'nowrap'
    }), [currentStyle, override, offset]);

    return (
        <div
            className={`caption-preview-container style-${currentStyle.name}`}
            onMouseDown={(e) => onMouseDown(e, index)}
            style={containerStyle}
        >
            {(caption.lines || [caption.words]).map((line, lineIdx) => (
                <div key={lineIdx} style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    transform: currentStyle.layout === 'stacked' ? `scale(${1 + lineIdx * 0.1})` : 'none',
                }}>
                    {line.map((wordObj, idx) => {
                        const isVisible = previewTime >= wordObj.start;
                        const isHighlight = caption.highlightWords && caption.highlightWords.includes(wordObj.word);

                        let animationStyle = {};
                        if (isVisible) {
                            if (currentStyle.animation === 'kinetic') {
                                animationStyle = { animation: 'kineticMove 3s infinite ease-in-out' };
                            } else if (currentStyle.animation === 'scaleIn') {
                                animationStyle = { animation: 'scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' };
                            } else if (currentStyle.animation === 'bounce') {
                                animationStyle = { animation: 'bounce 0.5s infinite' };
                            }
                        }

                        return (
                            <span
                                key={idx}
                                style={{
                                    display: 'inline-block',
                                    margin: '0 6px',
                                    opacity: isVisible ? 1 : 0.1,
                                    transform: isVisible
                                        ? 'translateY(0) scale(1)'
                                        : 'translateY(20px) scale(0.8)',
                                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    color: wordObj.smartStyle?.color || (isHighlight ? (currentStyle.highlightColor) : (override.color || currentStyle.textColor)),
                                    backgroundColor: isHighlight && currentStyle.highlightBg !== 'transparent'
                                        ? currentStyle.highlightBg : 'transparent',
                                    fontFamily: override.font || (isHighlight && currentStyle.highlightFontFamily ? currentStyle.highlightFontFamily : 'inherit'),
                                    fontStyle: isHighlight && currentStyle.highlightFontStyle ? currentStyle.highlightFontStyle : currentStyle.fontStyle || 'normal',
                                    fontWeight: wordObj.smartStyle?.fontWeight || (isHighlight ? (currentStyle.fontWeight + 100) : currentStyle.fontWeight),
                                    fontSize: override.fontSize ? `${override.fontSize}px` : currentStyle.fontSize,
                                    textShadow: wordObj.smartStyle?.textShadow || currentStyle.textShadow,
                                    padding: isHighlight ? '4px 10px' : '0',
                                    borderRadius: isHighlight ? '6px' : '0',
                                    ...animationStyle,
                                    ...wordObj.smartStyle
                                }}
                            >
                                {override.text || wordObj.word}
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );
});


// Memoized Overlay Item (Image or Text)
const OverlayItem = React.memo(({ overlay, onUpdate, onDragEnd }) => {
    const draggingRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        e.stopPropagation();
        draggingRef.current = true;
        startPosRef.current = { x: e.clientX - overlay.x, y: e.clientY - overlay.y };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!draggingRef.current) return;
        const newX = e.clientX - startPosRef.current.x;
        const newY = e.clientY - startPosRef.current.y;
        onUpdate(overlay.id, { x: newX, y: newY });
    };

    const handleMouseUp = (e) => {
        if (draggingRef.current) {
            draggingRef.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            // Final commit
            const newX = e.clientX - startPosRef.current.x;
            const newY = e.clientY - startPosRef.current.y;
            onDragEnd(overlay.id, newX, newY);
        }
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            style={{
                position: 'absolute',
                top: 0, left: 0,
                transform: `translate(${overlay.x}px, ${overlay.y}px) scale(${overlay.scale || 1})`,
                cursor: 'move',
                zIndex: 5,
                userSelect: 'none'
            }}
        >
            {overlay.type === 'text' ? (
                <div style={{
                    color: overlay.color || '#ffffff',
                    fontSize: `${overlay.fontSize || 40}px`,
                    fontWeight: overlay.fontWeight || 'bold',
                    fontFamily: overlay.fontFamily || 'Arial',
                    background: overlay.background || 'transparent',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px dashed rgba(255,255,255,0.3)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                    {overlay.text || 'Add Text'}
                </div>
            ) : (
                <img
                    src={overlay.src}
                    alt="Overlay"
                    style={{
                        width: overlay.width || 300,
                        height: 'auto',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        opacity: overlay.opacity || 1
                    }}
                    draggable={false}
                />
            )}
        </div>
    );
});

const VideoPreview = ({
    generatedCaptions,
    previewTime,
    isPlaying,
    setIsPlaying,
    setPreviewTime,
    videoUrl,
    captionOffsets,
    setCaptionOffsets,
    captionOverrides,
    onDragEnd,
    overlays = [],
    onUpdateOverlay,
    onOverlayDragEnd,
    aspectRatio = '9:16' // '9:16', '16:9', '1:1', '4:5'
}) => {
    const draggingRef = useRef(null);
    const isDragging = useRef(false);

    // Local state for smooth dragging without re-rendering parent
    const [localOffsets, setLocalOffsets] = useState(captionOffsets);

    // Sync local state
    useEffect(() => {
        if (!isDragging.current) {
            setLocalOffsets(captionOffsets);
        }
    }, [captionOffsets]);

    const currentStyle = useMemo(() =>
        (generatedCaptions && generatedCaptions.style && CAPTION_STYLES[generatedCaptions.style])
            ? CAPTION_STYLES[generatedCaptions.style]
            : CAPTION_STYLES.modern
        , [generatedCaptions?.style]);

    const currentIndex = useMemo(() => {
        if (!generatedCaptions) return -1;
        return generatedCaptions.captions.findIndex(
            c => previewTime >= c.start && previewTime <= c.end
        );
    }, [generatedCaptions, previewTime]);

    const currentCaption = currentIndex !== -1 ? generatedCaptions.captions[currentIndex] : null;

    // Draggable logic for captions
    const handleMouseDown = (e, index) => {
        if (index === -1) return;
        isDragging.current = true;
        const rect = e.currentTarget.getBoundingClientRect(); // relative to viewport, but we need delta
        draggingRef.current = {
            index,
            startX: e.clientX,
            startY: e.clientY,
            initialX: localOffsets[index]?.x || 0,
            initialY: localOffsets[index]?.y || 0
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!draggingRef.current) return;
        const { index, startX, startY, initialX, initialY } = draggingRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        setLocalOffsets(prev => ({
            ...prev,
            [index]: { x: initialX + dx, y: initialY + dy }
        }));
    };

    const handleMouseUp = (e) => {
        if (draggingRef.current) {
            const { index, startX, startY, initialX, initialY } = draggingRef.current;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const finalOffsets = {
                ...localOffsets,
                [index]: { x: initialX + dx, y: initialY + dy }
            };
            setCaptionOffsets(finalOffsets);
            if (onDragEnd) onDragEnd(finalOffsets);
            isDragging.current = false;
        }
        draggingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Calculate container dimensions based on Aspect Ratio
    // Fixed height of parent container (e.g. 80vh), width calculates from AR
    const getContainerDimensions = () => {
        // Base is height constrained in this layout usually
        const [w, h] = aspectRatio.split(':').map(Number);
        const ratio = w / h;

        // This logic would ideally span based on available space, 
        // For now let's assume a fixed max height of say 560px for desktop view
        const maxHeight = 560;
        const calcWidth = maxHeight * ratio;

        return { width: calcWidth, height: maxHeight };
    };

    const { width, height } = getContainerDimensions();


    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            overflow: 'hidden'
        }}>

            {/* The Canvas (Video Area) */}
            <div style={{
                position: 'relative',
                width: `${width}px`,
                height: `${height}px`,
                background: '#000',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                overflow: 'hidden' // Crop anything outside canvas
            }}>

                {/* Video Background */}
                <VideoPlayer
                    videoUrl={videoUrl}
                    isPlaying={isPlaying}
                    currentTime={previewTime}
                    onTimeUpdate={(e) => setPreviewTime(e.target.currentTime)}
                    onEnded={() => setIsPlaying(false)}
                />

                {/* Overlay Layer (Images/Texts) */}
                {overlays && overlays.map(overlay => (
                    <OverlayItem
                        key={overlay.id}
                        overlay={overlay}
                        onUpdate={onUpdateOverlay}
                        onDragEnd={onOverlayDragEnd}
                    />
                ))}

                {/* Caption Layer */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 20, // Ensure it's on top
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        {/* Wrapper allows centering. Offsets are relative to center */}
                        {currentCaption ? (
                            <CaptionOverlay
                                caption={currentCaption}
                                style={currentStyle}
                                previewTime={previewTime}
                                offset={localOffsets[currentIndex] || { x: 0, y: 0 }}
                                override={captionOverrides[currentIndex] || {}}
                                onMouseDown={handleMouseDown}
                                index={currentIndex}
                            />
                        ) : null}
                    </div>
                </div>

                {/* Scrubber / Progress (Overlay on bottom of video like Shorts/Reels? Or outside?) 
                    VEED typically has timeline at bottom outside. 
                    Let's keep a minimal one here for "preview" feel just in case.
                */}
                {generatedCaptions && (
                    <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        height: '4px',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 10
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${(previewTime / (generatedCaptions.captions[generatedCaptions.captions.length - 1]?.end || 1)) * 100}%`,
                            background: '#FF3366',
                        }} />
                    </div>
                )}

            </div>

            {/* Playback Controls (Outside Canvas) */}
            <div style={{ marginTop: '20px' }}>
                <PlaybackControls
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    onRewind={() => setPreviewTime(0)}
                />
            </div>

        </div>
    );
};

export default VideoPreview;
