import React from 'react';

const CaptionEditor = ({
    captions,
    captionOverrides,
    onUpdateOverride,
    currentTime,
    onSeek
}) => {
    const fonts = [
        "'Inter', sans-serif",
        "'Montserrat', sans-serif",
        "'Playfair Display', serif",
        "'Outfit', sans-serif",
        "'Helvetica Neue', Helvetica, Arial, sans-serif",
        "'Courier New', Courier, monospace"
    ];

    const handleTextChange = (index, text) => {
        onUpdateOverride(index, { ...captionOverrides[index], text });
    };

    const handleTimeChange = (index, field, value) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            onUpdateOverride(index, { ...captionOverrides[index], [field]: numValue });
        }
    };

    const handleFontChange = (index, font) => {
        onUpdateOverride(index, { ...captionOverrides[index], font });
    };

    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '28px',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            marginTop: '24px',
            maxHeight: '600px',
            overflowY: 'auto'
        }}>
            <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}>
                <span style={{ fontSize: '24px' }}>⌨️</span>
                Caption Editor
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {captions.map((caption, index) => {
                    const isActive = currentTime >= caption.start && currentTime <= caption.end;
                    const override = captionOverrides[index] || {};

                    return (
                        <div
                            key={index}
                            onClick={() => onSeek(caption.start)}
                            style={{
                                padding: '16px',
                                background: isActive ? 'rgba(255,51,102,0.1)' : 'rgba(255,255,255,0.03)',
                                borderRadius: '16px',
                                border: isActive ? '1px solid #FF3366' : '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 700 }}>#{index + 1}</span>
                                <input
                                    type="text"
                                    value={override.text !== undefined ? override.text : caption.text}
                                    onChange={(e) => handleTextChange(index, e.target.value)}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: '#fff',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '11px', opacity: 0.6 }}>Start:</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={override.start !== undefined ? override.start : caption.start}
                                        onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                                        style={{ width: '60px', background: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#fff', fontSize: '12px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '11px', opacity: 0.6 }}>End:</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={override.end !== undefined ? override.end : caption.end}
                                        onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                                        style={{ width: '60px', background: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#fff', fontSize: '12px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                                    <span style={{ fontSize: '11px', opacity: 0.6 }}>Font:</span>
                                    <select
                                        value={override.font || ''}
                                        onChange={(e) => handleFontChange(index, e.target.value)}
                                        style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid #444', borderRadius: '4px', fontSize: '11px', padding: '2px' }}
                                    >
                                        <option value="">Default</option>
                                        {fonts.map(f => (
                                            <option key={f} value={f}>{f.split(',')[0].replace(/'/g, '')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CaptionEditor;
