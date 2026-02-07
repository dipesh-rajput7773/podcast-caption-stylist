import React from 'react';
import { Player } from '@remotion/player';
import { CaptionComposition } from '../remotion/Composition';
import { generateCaptions } from '../utils/captionUtils';

const RemotionPlayer = ({
    captions,
    style,
    videoUrl,
    captionOffsets = {},
    captionOverrides = {}
}) => {
    // We expect pre-generated captions now to ensure consistency with the editor

    return (
        <div style={{
            width: '100%',
            maxWidth: '360px',
            aspectRatio: '9/16',
            margin: '0 auto',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
            <Player
                component={CaptionComposition}
                durationInFrames={30 * 10} // Dynamic based on transcript?
                compositionWidth={1080}
                compositionHeight={1920}
                fps={30}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                controls
                inputProps={{
                    transcript: captions,
                    style: style,
                    videoUrl: videoUrl,
                    captionOffsets,
                    captionOverrides
                }}
            />
        </div>
    );
};

export default RemotionPlayer;
