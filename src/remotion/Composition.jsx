import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Video } from 'remotion';
import { CAPTION_STYLES } from '../constants/styles';

export const CaptionComposition = ({
    transcript,
    style,
    audioUrl,
    videoUrl,
    captionOffsets = {},
    captionOverrides = {}
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    const currentCaptionIndex = transcript.findIndex(
        c => currentTime >= c.start && currentTime <= c.end
    );
    const currentCaption = currentCaptionIndex !== -1 ? transcript[currentCaptionIndex] : null;

    const currentStyle = CAPTION_STYLES[style] || CAPTION_STYLES.modern;
    const offset = currentCaptionIndex !== -1 ? captionOffsets[currentCaptionIndex] || { x: 0, y: 0 } : { x: 0, y: 0 };
    const override = currentCaptionIndex !== -1 ? captionOverrides[currentCaptionIndex] || {} : {};

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {videoUrl && (
                <Video
                    src={videoUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            )}



            {currentCaption && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    textAlign: 'center',
                    fontFamily: override.font || currentStyle.fontFamily,
                    fontSize: currentStyle.fontSize,
                    fontWeight: currentStyle.fontWeight,
                    fontStyle: currentStyle.fontStyle || 'normal',
                    textTransform: currentStyle.textTransform,
                    letterSpacing: currentStyle.letterSpacing,
                    color: currentStyle.textColor,
                    textShadow: currentStyle.textShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0 40px',
                    lineHeight: currentStyle.lineHeight || 1.3,
                    gap: currentStyle.layout === 'stacked' ? '12px' : '0',
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}>
                    {(currentCaption.lines || [currentCaption.words]).map((line, lineIdx) => (
                        <div key={lineIdx} style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            transform: currentStyle.layout === 'stacked' ? `scale(${1 + lineIdx * 0.1})` : 'none',
                        }}>
                            {line.map((wordObj, idx) => {
                                const wordStartFrame = wordObj.start * fps;
                                const isHighlight = currentCaption.highlightWords.includes(wordObj.word);

                                // Basic entry animation (fade + scale)
                                let opacity = interpolate(
                                    frame,
                                    [wordStartFrame - 5, wordStartFrame],
                                    [0, 1],
                                    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
                                );

                                if (currentStyle.animation === 'fadeInBlur') {
                                    opacity = interpolate(
                                        frame,
                                        [wordStartFrame - 8, wordStartFrame],
                                        [0, 1],
                                        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
                                    );
                                }

                                let scale = interpolate(
                                    frame,
                                    [wordStartFrame - 5, wordStartFrame],
                                    [0.8, 1],
                                    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
                                );

                                // Kinetic movement integration
                                let kineticY = 0;
                                let kineticRotate = 0;
                                if (currentStyle.animation === 'kinetic') {
                                    kineticY = Math.sin(frame / 10) * 3;
                                    kineticRotate = Math.sin(frame / 20) * 1;
                                }

                                return (
                                    <span
                                        key={idx}
                                        style={{
                                            display: 'inline-block',
                                            marginLeft: '8px',
                                            marginRight: '8px',
                                            opacity,
                                            transform: `scale(${scale}) translateY(${kineticY}px) rotate(${kineticRotate}deg)`,
                                            color: isHighlight ? currentStyle.highlightColor : currentStyle.textColor,
                                            backgroundColor: isHighlight && currentStyle.highlightBg !== 'transparent'
                                                ? currentStyle.highlightBg : 'transparent',
                                            fontFamily: isHighlight && currentStyle.highlightFontFamily ? currentStyle.highlightFontFamily : 'inherit',
                                            fontStyle: isHighlight && currentStyle.highlightFontStyle ? currentStyle.highlightFontStyle : currentStyle.fontStyle || 'normal',
                                            borderBottom: currentStyle.borderBottom && !isHighlight ? currentStyle.borderBottom : 'none',
                                            padding: isHighlight ? '4px 12px' : '0',
                                            borderRadius: isHighlight ? '8px' : '0',
                                        }}
                                    >
                                        {override.text || wordObj.word}
                                    </span>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </AbsoluteFill>
    );
};
