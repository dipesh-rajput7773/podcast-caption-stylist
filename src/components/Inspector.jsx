import React from 'react';

const Inspector = ({ selectedCaption, onUpdate, onUpdateOverride, onSeek, onSplit, onDelete, previewTime }) => {
    if (!selectedCaption || !selectedCaption.caption) {
        return (
            <div style={{
                padding: '20px', color: '#444', textAlign: 'center',
                fontSize: '13px', marginTop: '40px', fontWeight: 500
            }}>
                Select a caption segment on the timeline to inspect properties
            </div>
        );
    }

    const { caption, index, override } = selectedCaption;

    return (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. SEGMENET EDITOR */}
            <section>
                <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.1em' }}>
                    Segment Editor
                </p>
                <textarea
                    value={caption.text}
                    onChange={(e) => onUpdate(index, { ...caption, text: e.target.value })}
                    style={{
                        width: '100%', minHeight: '80px', background: '#0D0D0D', border: '1px solid #222',
                        borderRadius: '8px', padding: '12px', color: '#eee', fontSize: '13px', outline: 'none',
                        resize: 'none', lineHeight: '1.5'
                    }}
                />
            </section>

            {/* 2. TIMING CONTROL */}
            <section>
                <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.1em' }}>
                    Timing Control
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                        <label style={{ fontSize: '9px', color: '#444', display: 'block', marginBottom: '4px' }}>START</label>
                        <input
                            type="number" step="0.01" value={caption.start.toFixed(2)}
                            onChange={(e) => onUpdate(index, { ...caption, start: parseFloat(e.target.value) })}
                            style={{ width: '100%', background: '#0D0D0D', border: '1px solid #222', borderRadius: '4px', padding: '6px', color: '#FF3366', fontSize: '12px', fontWeight: 700 }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '9px', color: '#444', display: 'block', marginBottom: '4px' }}>END</label>
                        <input
                            type="number" step="0.01" value={caption.end.toFixed(2)}
                            onChange={(e) => onUpdate(index, { ...caption, end: parseFloat(e.target.value) })}
                            style={{ width: '100%', background: '#0D0D0D', border: '1px solid #222', borderRadius: '4px', padding: '6px', color: '#FF3366', fontSize: '12px', fontWeight: 700 }}
                        />
                    </div>
                </div>
            </section>

            {/* 3. AI INSIGHT */}
            <section>
                <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.1em' }}>
                    AI Transcription Insight
                </p>
                <div style={{
                    padding: '12px', background: 'rgba(255,51,102,0.05)', border: '1px solid rgba(255,51,102,0.1)',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: caption.confidence < 0.8 ? '#FF3366' : '#00F260',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, color: '#000'
                    }}>
                        {(caption.confidence * 100).toFixed(0)}%
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '11px', fontWeight: 700 }}>Whisper Confidence</p>
                        <p style={{ margin: 0, fontSize: '10px', color: '#666' }}>
                            {caption.confidence < 0.8 ? 'Needs manual review' : 'High quality segment'}
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. SMART SUGGESTIONS */}
            <section>
                <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.1em' }}>
                    Smart Suggestions
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {caption.text.toLowerCase().includes('tsla') && !caption.text.includes('TSLA') && (
                        <button
                            onClick={() => onUpdate(index, { ...caption, text: caption.text.replace(/tsla/i, 'TSLA') })}
                            style={{ padding: '8px', background: '#00F260', border: 'none', borderRadius: '4px', color: '#000', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                            🚀 Format "TSLA" as Ticker
                        </button>
                    )}
                    {caption.text.toLowerCase().includes('bullish') && !caption.text.includes('BULLISH') && (
                        <button
                            onClick={() => onUpdate(index, { ...caption, text: caption.text.replace(/bullish/i, 'BULLISH') })}
                            style={{ padding: '8px', background: '#00F260', border: 'none', borderRadius: '4px', color: '#000', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                            📈 Emphasize "BULLISH"
                        </button>
                    )}
                    <p style={{ fontSize: '10px', color: '#333', textAlign: 'center', margin: 0 }}>AI analyzing for more signals...</p>
                </div>
            </section>

            {/* 5. MANUAL STYLE OVERRIDES */}
            <section>
                <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.1em' }}>
                    Manual Style Overrides
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#1A1A1A', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                    <div>
                        <label style={{ fontSize: '9px', color: '#666', display: 'block', marginBottom: '4px' }}>FONT FAMILY</label>
                        <input
                            type="text"
                            placeholder="e.g. Arial, Helvetica"
                            value={override.font || ''}
                            onChange={(e) => onUpdateOverride(index, { ...override, font: e.target.value })}
                            style={{ width: '100%', background: '#0D0D0D', border: '1px solid #333', borderRadius: '4px', padding: '6px', color: '#eee', fontSize: '12px' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <label style={{ fontSize: '9px', color: '#666', display: 'block', marginBottom: '4px' }}>FONT SIZE (PX)</label>
                            <input
                                type="number"
                                value={override.fontSize || ''}
                                onChange={(e) => {
                                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                    onUpdateOverride(index, { ...override, fontSize: val });
                                }}
                                style={{ width: '100%', background: '#0D0D0D', border: '1px solid #333', borderRadius: '4px', padding: '6px', color: '#eee', fontSize: '12px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '9px', color: '#666', display: 'block', marginBottom: '4px' }}>COLOR</label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                    type="color"
                                    value={override.color || '#FFFFFF'}
                                    onChange={(e) => onUpdateOverride(index, { ...override, color: e.target.value })}
                                    style={{ width: '24px', height: '28px', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    value={override.color || ''}
                                    placeholder="#FFFFFF"
                                    onChange={(e) => onUpdateOverride(index, { ...override, color: e.target.value })}
                                    style={{ flex: 1, background: '#0D0D0D', border: '1px solid #333', borderRadius: '4px', padding: '6px', color: '#eee', fontSize: '12px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. WORD DETAILS */}
            <section>
                <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.1em' }}>
                    Word Details
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {caption.words?.map((w, i) => (
                        <div key={i} style={{
                            padding: '4px 8px', background: '#1A1A1A', border: '1px solid #222', borderRadius: '4px',
                            fontSize: '11px', color: w.confidence < 0.7 ? '#FF3366' : '#ccc', cursor: 'pointer'
                        }} onClick={() => onSeek(w.start)}>
                            {w.word}
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. ACTIONS (SPLIT/DELETE) */}
            <section>
                <p style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.1em' }}>
                    Actions
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => onSplit && onSplit(previewTime)}
                        style={{ flex: 1, padding: '10px', background: '#222', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        title="Split caption at current playhead position"
                    >
                        ✂️ Split
                    </button>
                    <button
                        onClick={() => onDelete && onDelete(index)}
                        style={{ flex: 1, padding: '10px', background: '#222', border: '1px solid #333', borderRadius: '6px', color: '#FF3366', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Inspector;
