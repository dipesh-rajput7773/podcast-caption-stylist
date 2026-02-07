import React from 'react';

const HistoryPanel = ({ history, currentStep, onJump }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
        }}>
            <p style={{
                fontSize: '10px',
                color: '#555',
                textTransform: 'uppercase',
                fontWeight: 800,
                letterSpacing: '0.1em',
                marginBottom: '4px'
            }}>
                History
            </p>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '6px'
            }}>
                {history.length === 0 && (
                    <p style={{ fontSize: '11px', color: '#333', fontStyle: 'italic' }}>
                        No actions yet
                    </p>
                )}
                {history.map((layer, idx) => (
                    <button
                        key={idx}
                        onClick={() => onJump(idx)}
                        style={{
                            padding: '10px 12px',
                            background: idx === currentStep ? 'rgba(255, 51, 102, 0.1)' : '#1A1A1A',
                            border: `1px solid ${idx === currentStep ? '#FF3366' : '#222'}`,
                            borderRadius: '8px',
                            color: idx === currentStep ? '#FF3366' : '#888',
                            fontSize: '12px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s ease',
                            opacity: idx > currentStep ? 0.4 : 1
                        }}
                    >
                        <span style={{ fontWeight: 600 }}>
                            {layer.label || `Action ${idx + 1}`}
                        </span>
                        <span style={{ fontSize: '10px', opacity: 0.5 }}>
                            {new Date(layer.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </button>
                )).reverse()}
            </div>

            <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#0D0D0D',
                borderRadius: '8px',
                border: '1px solid #222'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#666' }}>Undo Steps</span>
                    <span style={{ fontSize: '11px', color: '#FF3366', fontWeight: 800 }}>{currentStep + 1} / {history.length}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${((currentStep + 1) / history.length) * 100}%`,
                        height: '100%',
                        background: '#FF3366'
                    }} />
                </div>
            </div>
        </div>
    );
};

export default HistoryPanel;
