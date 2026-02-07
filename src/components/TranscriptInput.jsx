import React from 'react';

const TranscriptInput = ({
    rawTranscript,
    setRawTranscript,
    onLoadSample,
    onGenerate,
    onVideoUpload,
    isProcessing,
    showUpload = true
}) => {
    return (
        <>
            {showUpload && (
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '8px',
                    }}>
                        Upload Video (Auto-Transcribe)
                    </label>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        marginBottom: '16px'
                    }}>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={onVideoUpload}
                            style={{ color: '#fff' }}
                        />
                    </div>
                </div>
            )}
            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '8px',
                }}>Transcript JSON</label>
                <textarea
                    value={rawTranscript}
                    onChange={(e) => setRawTranscript(e.target.value)}
                    placeholder={`Paste JSON array or plain text...\n\n[{"word": "Hello", "start": 0.0, "end": 0.3}, ...]`}
                    style={{
                        width: '100%',
                        height: '200px',
                        padding: '16px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '13px',
                        fontFamily: "'JetBrains Mono', monospace",
                        resize: 'vertical',
                        outline: 'none',
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={onLoadSample}
                    style={{
                        flex: 1,
                        padding: '14px 20px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    Load Sample
                </button>
                <button
                    onClick={onGenerate}
                    disabled={isProcessing}
                    style={{
                        flex: 2,
                        padding: '14px 24px',
                        background: isProcessing
                            ? 'rgba(255,51,102,0.5)'
                            : 'linear-gradient(135deg, #FF3366 0%, #FF6B6B 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: isProcessing ? 'wait' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 20px rgba(255,51,102,0.4)',
                    }}
                >
                    {isProcessing ? '⏳ Processing...' : '✨ Generate Captions'}
                </button>
            </div>
        </>
    );
};

export default TranscriptInput;
