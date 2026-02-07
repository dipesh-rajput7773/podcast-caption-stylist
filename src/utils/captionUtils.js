// Important words to highlight
const IMPORTANT_PATTERNS = [
    'success', 'moment', 'realize', 'consistency', 'never', 'always',
    'important', 'key', 'secret', 'truth', 'power', 'change', 'life',
    'money', 'time', 'love', 'hate', 'fear', 'dream', 'goal', 'win',
    'lose', 'best', 'worst', 'first', 'last', 'only', 'everything',
    'nothing', 'believe', 'think', 'know', 'feel', 'want', 'need'
];

/**
 * Identify important words for highlighting
 */
export function identifyImportantWords(words, maxHighlights = 2, emphasisData = []) {
    // If we have AI emphasis data, use it
    if (emphasisData && emphasisData.length > 0) {
        return words
            .map(w => {
                const emphasis = emphasisData.find(e =>
                    e.word.toLowerCase() === w.word.toLowerCase().replace(/[.,!?]/g, '')
                );
                return { ...w, emphasisScore: emphasis ? emphasis.score : 0 };
            })
            .sort((a, b) => b.emphasisScore - a.emphasisScore)
            .slice(0, maxHighlights)
            .map(w => w.word);
    }

    // Fallback to pattern matching
    return words
        .filter(w =>
            IMPORTANT_PATTERNS.some(p => w.word.toLowerCase().includes(p)) ||
            w.word.length > 7
        )
        .slice(0, maxHighlights)
        .map(w => w.word);
}

/**
 * Check if there's a natural pause between words
 */
export function isNaturalPause(currentWord, nextWord, threshold = 0.3) {
    if (!nextWord) return true;
    return (nextWord.start - currentWord.end) > threshold;
}

/**
 * Generate captions from transcript
 */
export function generateCaptions(transcript, options = {}) {
    const {
        maxWordsPerCaption = 5,
        minWordsPerCaption = 3,
        pauseThreshold = 0.3,
        maxHighlights = 2,
        minDisplayDuration = 1.5 // Minimum seconds each caption stays visible
    } = options;

    const captions = [];
    let currentCaption = [];
    let captionStart = transcript[0]?.start || 0;

    transcript.forEach((wordObj, index) => {
        currentCaption.push(wordObj);

        const hasNaturalPause = isNaturalPause(
            wordObj,
            transcript[index + 1],
            pauseThreshold
        );
        const isCaptionFull = currentCaption.length >= maxWordsPerCaption;
        const isLastWord = index === transcript.length - 1;
        const meetsMinimum = currentCaption.length >= minWordsPerCaption;

        if ((hasNaturalPause && meetsMinimum) || isCaptionFull || isLastWord) {
            const text = currentCaption.map(w => w.word).join(' ');
            const highlights = identifyImportantWords(currentCaption, maxHighlights, options.emphasisData);

            // Split into lines for "stacked" style
            const lines = [];
            if (options.layout === 'stacked') {
                // Smarter split: try to split before an emphasized word if possible
                if (currentCaption.length > 3) {
                    const mid = Math.floor(currentCaption.length / 2);
                    // Find index of highest emphasis word
                    let bestSplitIdx = mid;
                    if (options.emphasisData) {
                        let maxScore = -1;
                        currentCaption.forEach((w, i) => {
                            const emp = options.emphasisData.find(e =>
                                e.word.toLowerCase() === w.word.toLowerCase().replace(/[.,!?]/g, '')
                            );
                            if (emp && emp.score > maxScore) {
                                maxScore = emp.score;
                                bestSplitIdx = i;
                            }
                        });
                        // Don't split exactly on the word, maybe just before it if it's not the first/last
                        if (bestSplitIdx > 0 && bestSplitIdx < currentCaption.length) {
                            lines.push(currentCaption.slice(0, bestSplitIdx));
                            lines.push(currentCaption.slice(bestSplitIdx));
                        } else {
                            lines.push(currentCaption.slice(0, mid));
                            lines.push(currentCaption.slice(mid));
                        }
                    } else {
                        lines.push(currentCaption.slice(0, mid));
                        lines.push(currentCaption.slice(mid));
                    }
                } else {
                    lines.push(currentCaption);
                }
            } else {
                lines.push(currentCaption);
            }

            // Extend end time to ensure minimum display duration
            const naturalEnd = wordObj.end;
            const minEnd = captionStart + minDisplayDuration;

            // Fix Overlap: Clamp end time to the start of the next word (if exists)
            // We need to look ahead to the next word in the full transcript
            let nextWordStart = null;
            if (index < transcript.length - 1) {
                nextWordStart = transcript[index + 1].start;
            }

            let extendedEnd = Math.max(naturalEnd, minEnd);

            // If the extended end pushes into the next word, cut it short
            // Leave a tiny gap (0.1s) to prevent visual bleeding
            if (nextWordStart && extendedEnd > nextWordStart) {
                extendedEnd = Math.max(naturalEnd, nextWordStart - 0.05);
            }

            // Calculate segment confidence
            const avgConfidence = currentCaption.length > 0
                ? currentCaption.reduce((acc, w) => acc + (w.confidence || 1.0), 0) / currentCaption.length
                : 1.0;

            captions.push({
                text,
                start: captionStart,
                end: extendedEnd,
                highlightWords: highlights,
                lines, // Store lines for rendering
                confidence: avgConfidence,
                words: currentCaption.map(w => ({
                    word: w.word,
                    start: w.start,
                    end: w.end,
                    confidence: w.confidence || 1.0
                }))
            });

            currentCaption = [];
            if (index < transcript.length - 1) {
                captionStart = transcript[index + 1].start;
            }
        }
    });

    return captions;
}

import { TONE_TO_STYLE } from '../constants/styles';

// ... existing code ...

/**
 * Get style based on tone
 */
export function getStyleFromTone(tone) {
    return TONE_TO_STYLE[tone] || 'modern';
}
