/**
 * Parse transcript from various formats
 */
export function parseTranscript(input) {
    // Try JSON first
    try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
            return { success: true, data: parsed };
        }
        if (parsed.transcript && Array.isArray(parsed.transcript)) {
            return { success: true, data: parsed.transcript };
        }
    } catch (e) {
        // Not JSON, try other formats
    }

    // Try SRT format
    if (input.includes('-->')) {
        return { success: true, data: parseSRT(input) };
    }

    // Plain text - auto-generate timestamps
    return { success: true, data: parsePlainText(input) };
}

/**
 * Parse plain text into word array with estimated timestamps
 */
function parsePlainText(text) {
    const words = text.split(/\s+/).filter(Boolean);
    let time = 0;

    return words.map(word => {
        const duration = 0.1 + (word.length * 0.05);
        const item = {
            word,
            start: parseFloat(time.toFixed(3)),
            end: parseFloat((time + duration).toFixed(3))
        };
        time += duration + 0.05;
        return item;
    });
}

/**
 * Parse SRT format
 */
function parseSRT(srt) {
    const blocks = srt.trim().split(/\n\n+/);
    const words = [];

    blocks.forEach(block => {
        const lines = block.split('\n');
        if (lines.length >= 3) {
            const timeMatch = lines[1].match(
                /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
            );
            if (timeMatch) {
                const start = parseTimestamp(timeMatch.slice(1, 5));
                const end = parseTimestamp(timeMatch.slice(5, 9));
                const text = lines.slice(2).join(' ');
                const textWords = text.split(/\s+/);
                const wordDuration = (end - start) / textWords.length;

                textWords.forEach((word, i) => {
                    words.push({
                        word: word.replace(/<[^>]*>/g, ''),
                        start: start + (i * wordDuration),
                        end: start + ((i + 1) * wordDuration)
                    });
                });
            }
        }
    });

    return words;
}

function parseTimestamp([h, m, s, ms]) {
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
}
