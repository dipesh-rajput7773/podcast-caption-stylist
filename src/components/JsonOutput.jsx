import React from 'react';

const JsonOutput = ({ generatedCaptions }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(generatedCaptions, null, 2));
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '28px',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            gridColumn: 'span 1',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
            }}>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}>
                    <span style={{ fontSize: '24px' }}>📤</span>
                    JSON Output
                </h2>
                {generatedCaptions && (
                    <button
                        onClick={copyToClipboard}
                        style={{
                            padding: '10px 16px',
                            background: 'rgba(78,205,196,0.2)',
                            border: '1px solid rgba(78,205,196,0.4)',
                            borderRadius: '10px',
                            color: '#4ECDC4',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        📋 Copy JSON
                    </button>
                )}
            </div>

            <pre style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                color: '#4ECDC4',
                overflow: 'auto',
                maxHeight: '400px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}>
                {generatedCaptions
                    ? JSON.stringify(generatedCaptions, null, 2)
                    : '{\n  "style": "...",\n  "captions": []\n}'
                }
            </pre>
        </div>
    );
};

export default JsonOutput;
