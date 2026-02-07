import React from 'react';
import { FONTS, LAYOUT_MODES } from '../constants/styles';

const StyleSelector = ({
    selectedFont, setSelectedFont,
    selectedLayout, setSelectedLayout
}) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
        }}>
            {/* Font Selector */}
            <div>
                <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#666',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                }}>Typography</label>
                <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: '#222',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        color: '#eee',
                        fontSize: '13px',
                        cursor: 'pointer',
                        outline: 'none',
                    }}
                >
                    {Object.entries(FONTS).map(([key, config]) => (
                        <option key={key} value={key}>{config.name}</option>
                    ))}
                </select>
            </div>

            {/* Layout Selector */}
            <div>
                <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#666',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                }}>Layout Style</label>
                <select
                    value={selectedLayout}
                    onChange={(e) => setSelectedLayout(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: '#222',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        color: '#eee',
                        fontSize: '13px',
                        cursor: 'pointer',
                        outline: 'none',
                    }}
                >
                    {Object.values(LAYOUT_MODES).map(mode => (
                        <option key={mode.value} value={mode.value}>{mode.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default StyleSelector;
