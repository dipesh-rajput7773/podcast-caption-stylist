// Comprehensive list of major tickers (can be expanded or replaced with API later)
export const KEY_TICKERS = [
    'TSLA', 'AAPL', 'BTC', 'ETH', 'NVDA', 'AMD', 'SPY', 'QQQ', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX', 'COIN', 'MSTR'
];

export const BULLISH_TERMS = [
    'bull', 'bullish', 'long', 'call', 'calls', 'breakout', 'rally', 'moon', 'pump', 'buy', 'higher', 'support', 'green', 'up', 'profit'
];

export const BEARISH_TERMS = [
    'bear', 'bearish', 'short', 'put', 'puts', 'crash', 'dump', 'sell', 'drop', 'lower', 'resistance', 'red', 'down', 'loss'
];

export const TRADING_JARGON = [
    'consolidation', 'liquidity', 'volatility', 'markup', 'markdown', 'chop', 'range', 'trend', 'volume', 'leverage'
];

export const detectTradingTerms = (text) => {
    // Split original text to ensure we match the exact words in the caption objects
    const words = text.split(/\s+/);

    const detected = {
        tickers: [],
        bullish: [],
        bearish: [],
        jargon: [],
        prices: []
    };

    words.forEach(word => {
        // Clean for analysis (remove punctuation like comma, dot, exclamation)
        const cleanWord = word.replace(/[.,!?]/g, '');
        const upper = cleanWord.toUpperCase();
        const lower = cleanWord.toLowerCase();

        // Check for tickers (Explicit list OR $TICKER format)
        // Check upper (cleaned)
        if (KEY_TICKERS.includes(upper.replace('$', '')) || /^\$[A-Z]{2,5}$/.test(upper)) {
            detected.tickers.push(word);
            return;
        }

        // Use cleaned lower for term matching
        if (BULLISH_TERMS.some(term => lower.includes(term))) {
            detected.bullish.push(word);
            return;
        }

        if (BEARISH_TERMS.some(term => lower.includes(term))) {
            detected.bearish.push(word);
            return;
        }

        if (TRADING_JARGON.some(term => lower.includes(term))) {
            detected.jargon.push(word);
            return;
        }

        // Check for prices (e.g., $180, 50.50, 10K, $2M)
        if (/^\$?\d+(\.\d+)?[kKmM]?$/.test(cleanWord)) {
            detected.prices.push(word);
        }
    });

    return detected;
};

export const getSmartStyle = (word, detected) => {
    // Priority: Ticker > Price > Bullish > Bearish > Jargon

    // Exact match or partial match logic
    // Tickers: GREEN + BOLD
    if (detected.tickers.includes(word)) {
        return {
            color: '#00FF00',
            fontWeight: '900',
            textShadow: '0 0 15px rgba(0,255,0,0.6)',
            letterSpacing: '0.05em'
        };
    }

    // Prices: GOLD + BOLD
    if (detected.prices.includes(word)) {
        return {
            color: '#FFD700',
            fontWeight: '800',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.4)'
        };
    }

    // Bullish: BRIGHT GREEN
    if (detected.bullish.includes(word)) {
        return {
            color: '#00F260',
            fontWeight: '800',
            fontStyle: 'italic'
        };
    }

    // Bearish: BRIGHT RED/ORANGE
    if (detected.bearish.includes(word)) {
        return {
            color: '#FF3366',
            fontWeight: '800',
            fontStyle: 'italic'
        };
    }

    // Jargon: PURPLE/WHITE Hint
    if (detected.jargon.includes(word)) {
        return {
            color: '#A855F7',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            fontWeight: '600'
        };
    }

    return null;
};
