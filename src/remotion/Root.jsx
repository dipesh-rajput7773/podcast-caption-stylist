import { Composition } from 'remotion';
import { CaptionComposition } from './Composition';
import { MOCK_HINGLISH_TRANSCRIPT } from '../utils/mockTranscriber';
import { generateCaptions } from '../utils/captionUtils';
import '../styles/global.css';

// Generate captions for the mock transcript
const captions = generateCaptions(MOCK_HINGLISH_TRANSCRIPT);

export const RemotionRoot = () => {
    return (
        <>
            <Composition
                id="PodcastClip"
                component={CaptionComposition}
                durationInFrames={30 * 10} // 10 seconds at 30fps
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    transcript: captions,
                    style: 'hinglish',
                    videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' // Placeholder sample
                }}
            />
        </>
    );
};
