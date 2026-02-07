import React from 'react';
import { CAPTION_STYLES } from '../constants/styles';

const StyleShowcase = () => {
    return (
        <div style={{
            maxWidth: '1400px',
            margin: '40px auto 0',
            padding: '28px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
        }}>
            <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '20px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.7)',
            }}>
                Available Caption Styles
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
            }}>
                {Object.entries(CAPTION_STYLES).map(([key, style]) => (
                    <div
                        key={key}
                        style={{
                            background: style.bgGradient,
                            borderRadius: '16px',
                            padding: '24px',
                            textAlign: 'center',
                            border: '2px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <p style={{
                            fontFamily: style.fontFamily,
                            fontSize: '20px',
                            fontWeight: style.fontWeight,
                            textTransform: style.textTransform,
                            letterSpacing: style.letterSpacing,
                            color: style.textColor,
                            textShadow: style.textShadow,
                            marginBottom: '8px',
                        }}>
                            The <span style={{ color: style.highlightColor }}>moment</span> you
                        </p>
                        <span style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.5)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                        }}>
                            {style.name} Style
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StyleShowcase;
