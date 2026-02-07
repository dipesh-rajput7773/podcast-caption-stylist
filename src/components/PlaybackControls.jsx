import React from 'react';

const PlaybackControls = ({ isPlaying, setIsPlaying, onRewind }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '24px',
        }}>
            <button
                onClick={onRewind}
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                ⏮
            </button>
            <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF3366 0%, #FF6B6B 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(255,51,102,0.4)',
                }}
            >
                {isPlaying ? '⏸' : '▶'}
            </button>
        </div>
    );
};

export default PlaybackControls;
