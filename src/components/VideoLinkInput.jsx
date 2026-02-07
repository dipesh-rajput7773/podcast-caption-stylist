import React, { useState } from 'react';

const VideoLinkInput = ({ onTranscribe, isProcessing }) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const validateUrl = (input) => {
        const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)/;
        const instagramPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p)\//;
        return youtubePattern.test(input) || instagramPattern.test(input);
    };

    const handleSubmit = async () => {
        setError('');

        if (!url.trim()) {
            setError('Please enter a video URL');
            return;
        }

        if (!validateUrl(url)) {
            setError('Please enter a valid YouTube Shorts or Instagram Reels URL');
            return;
        }

        try {
            await onTranscribe(url);
        } catch (err) {
            setError(err.message || 'Failed to process video');
        }
    };

    return (
        <div style={{
            marginBottom: '20px',
        }}>
            <label style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.8)',
            }}>
                Paste Video Link (YouTube Shorts / Instagram Reels)
            </label>

            <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
            }}>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        setError('');
                    }}
                    placeholder="https://youtube.com/shorts/... or https://instagram.com/reel/..."
                    disabled={isProcessing}
                    style={{
                        flex: 1,
                        minWidth: '250px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: error ? '2px solid #FF6B6B' : '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                        if (!error) e.target.style.border = '1px solid rgba(255,255,255,0.4)';
                    }}
                    onBlur={(e) => {
                        if (!error) e.target.style.border = '1px solid rgba(255,255,255,0.2)';
                    }}
                />

                <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !url.trim()}
                    style={{
                        padding: '14px 28px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isProcessing
                            ? 'linear-gradient(135deg, #666 0%, #444 100%)'
                            : 'linear-gradient(135deg, #FF3366 0%, #FF6B6B 100%)',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    {isProcessing ? (
                        <>
                            <span style={{
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTop: '2px solid #fff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }} />
                            Processing...
                        </>
                    ) : (
                        <>
                            <span>🔗</span>
                            Transcribe URL
                        </>
                    )}
                </button>
            </div>

            {error && (
                <p style={{
                    marginTop: '10px',
                    color: '#FF6B6B',
                    fontSize: '13px',
                }}>
                    ⚠️ {error}
                </p>
            )}

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default VideoLinkInput;
