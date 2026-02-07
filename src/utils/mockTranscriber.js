export const MOCK_HINGLISH_TRANSCRIPT = [
    { word: "Aaj", start: 0.0, end: 0.3 },
    { word: "ka", start: 0.3, end: 0.5 },
    { word: "topic", start: 0.5, end: 1.0 },
    { word: "hai", start: 1.0, end: 1.2 },
    { word: "consistency", start: 1.2, end: 2.0 },
    { word: "Jo", start: 2.2, end: 2.4 },
    { word: "aapko", start: 2.4, end: 2.8 },
    { word: "kabhi", start: 2.8, end: 3.1 },
    { word: "bhi", start: 3.1, end: 3.3 },
    { word: "give", start: 3.3, end: 3.6 },
    { word: "up", start: 3.6, end: 3.8 },
    { word: "karne", start: 3.8, end: 4.2 },
    { word: "nahi", start: 4.2, end: 4.5 },
    { word: "dega", start: 4.5, end: 5.0 },
    { word: "Bas", start: 5.2, end: 5.5 },
    { word: "keep", start: 5.5, end: 5.8 },
    { word: "going", start: 5.8, end: 6.2 },
    { word: "aur", start: 6.2, end: 6.5 },
    { word: "result", start: 6.5, end: 7.0 },
    { word: "pakka", start: 7.0, end: 7.5 },
    { word: "milega", start: 7.5, end: 8.0 }
];

export function mockTranscribeVideo(file) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            resolve(MOCK_HINGLISH_TRANSCRIPT);
        }, 1500);
    });
}
