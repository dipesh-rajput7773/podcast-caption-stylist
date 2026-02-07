import React, { useState } from 'react';

const ViralContentGenerator = ({ script, onGenerate }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [content, setContent] = useState(null);
    const [selectedTypes, setSelectedTypes] = useState({
        title: true,
        hashtags: true,
        captions: true,
        trends: true,
    });
    const [copiedField, setCopiedField] = useState(null);

    const handleGenerate = async () => {
        if (!script) return;

        setIsGenerating(true);
        try {
            const types = Object.keys(selectedTypes).filter(k => selectedTypes[k]);
            const result = await onGenerate(script, types);
            setContent(result);
        } catch (err) {
            console.error('Generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const toggleType = (type) => {
        setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const cardStyle = {
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
    };

    const copyButtonStyle = {
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        borderRadius: '8px',
        padding: '6px 12px',
        color: '#fff',
        fontSize: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    };

    if (!script) return null;

    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '28px',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            marginTop: '24px',
        }}>
            <h2 style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}>
                <span style={{ fontSize: '24px' }}>🚀</span>
                Generate Viral Content
            </h2>

            {/* Content Type Toggles */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '20px',
            }}>
                {[
                    { key: 'title', icon: '🎯', label: 'Title' },
                    { key: 'hashtags', icon: '#️⃣', label: 'Hashtags' },
                    { key: 'captions', icon: '✍️', label: 'Captions' },
                    { key: 'trends', icon: '📈', label: 'Trends' },
                ].map(({ key, icon, label }) => (
                    <button
                        key={key}
                        onClick={() => toggleType(key)}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '12px',
                            border: selectedTypes[key]
                                ? '2px solid #4ECDC4'
                                : '2px solid rgba(255,255,255,0.2)',
                            background: selectedTypes[key]
                                ? 'rgba(78, 205, 196, 0.2)'
                                : 'transparent',
                            color: '#fff',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <span>{icon}</span>
                        {label}
                    </button>
                ))}
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !Object.values(selectedTypes).some(Boolean)}
                style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isGenerating
                        ? 'linear-gradient(135deg, #666 0%, #444 100%)'
                        : 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '24px',
                }}
            >
                {isGenerating ? '✨ Generating...' : '✨ Generate Viral Content'}
            </button>

            {/* Generated Content Display */}
            {content && (
                <div>
                    {/* Title */}
                    {content.title && (
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                    🎯 Catchy Title
                                </h3>
                                <button
                                    style={copyButtonStyle}
                                    onClick={() => copyToClipboard(content.title, 'title')}
                                >
                                    {copiedField === 'title' ? '✓ Copied!' : 'Copy'}
                                </button>
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                {content.title}
                            </p>
                        </div>
                    )}

                    {/* Hashtags */}
                    {content.hashtags && content.hashtags.length > 0 && (
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                    #️⃣ Hashtags
                                </h3>
                                <button
                                    style={copyButtonStyle}
                                    onClick={() => copyToClipboard(content.hashtags.join(' '), 'hashtags')}
                                >
                                    {copiedField === 'hashtags' ? '✓ Copied!' : 'Copy All'}
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {content.hashtags.map((tag, i) => (
                                    <span key={i} style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        background: 'rgba(78, 205, 196, 0.2)',
                                        color: '#4ECDC4',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Captions */}
                    {content.captions && content.captions.length > 0 && (
                        <div style={cardStyle}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                ✍️ Caption Options
                            </h3>
                            {content.captions.map((caption, i) => (
                                <div key={i} style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '12px',
                                    padding: '14px',
                                    marginBottom: i < content.captions.length - 1 ? '10px' : 0,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                }}>
                                    <p style={{ margin: 0, fontSize: '14px', flex: 1 }}>{caption}</p>
                                    <button
                                        style={copyButtonStyle}
                                        onClick={() => copyToClipboard(caption, `caption-${i}`)}
                                    >
                                        {copiedField === `caption-${i}` ? '✓' : 'Copy'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Trends */}
                    {content.trends && content.trends.length > 0 && (
                        <div style={cardStyle}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                📈 Trend Suggestions
                            </h3>
                            {content.trends.map((trend, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    marginBottom: i < content.trends.length - 1 ? '12px' : 0,
                                }}>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #FF3366 0%, #FF6B6B 100%)',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}>
                                        {i + 1}
                                    </span>
                                    <p style={{ margin: 0, fontSize: '14px' }}>{trend}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViralContentGenerator;
