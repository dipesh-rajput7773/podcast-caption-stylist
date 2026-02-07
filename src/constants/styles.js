export const CAPTION_STYLES = {
    clean: {
        name: "Clean",
        tone: "calm",
        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
        fontSize: "clamp(24px, 6vw, 42px)",
        fontWeight: 600,
        textTransform: "none",
        letterSpacing: "-0.02em",
        highlightColor: "#FFFFFF",
        highlightBg: "transparent",
        textColor: "rgba(255,255,255,0.85)",
        textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        animation: "fadeUp",
        bgGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    },

    modern: {
        name: "Modern",
        tone: "serious",
        fontFamily: "'Clash Display', 'Montserrat', sans-serif",
        fontSize: "clamp(26px, 7vw, 48px)",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        highlightColor: "#FFE66D",
        highlightBg: "rgba(255,230,109,0.15)",
        textColor: "#FFFFFF",
        textShadow: "0 4px 30px rgba(0,0,0,0.8)",
        animation: "scale",
        bgGradient: "linear-gradient(180deg, #0D0D0D 0%, #1a1a1a 100%)",
    },

    viral: {
        name: "Viral",
        tone: "energetic",
        fontFamily: "'Bebas Neue', 'Impact', sans-serif",
        fontSize: "clamp(28px, 8vw, 56px)",
        fontWeight: 400,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        highlightColor: "#FF3366",
        highlightBg: "#FF3366",
        highlightTextColor: "#FFFFFF",
        textColor: "#FFFFFF",
        textShadow: "4px 4px 0 #000, -2px -2px 0 #000",
        animation: "bounce",
        bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },

    hinglish: {
        name: "Hinglish",
        tone: "mixed",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: "clamp(26px, 7vw, 48px)",
        fontWeight: 700,
        textTransform: "none",
        letterSpacing: "-0.05em",
        highlightColor: "#FFD700",
        highlightBg: "transparent",
        highlightFontFamily: "'Playfair Display', serif", // Special property for this style
        highlightFontStyle: "italic",
        textColor: "#FFFFFF",
        textShadow: "0 2px 10px rgba(0,0,0,0.5)",
        animation: "fadeUp",
        bgGradient: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
    },

    hormozi: {
        name: "Hormozi",
        tone: "hype",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: "clamp(18px, 5vw, 32px)", // Smaller, cleaner
        fontWeight: 600,
        textTransform: "none",
        letterSpacing: "-0.01em",
        highlightColor: "#FFE600", // Bright yellow
        highlightBg: "transparent",
        highlightFontFamily: "'Playfair Display', serif", // Elegant highlight font
        highlightFontStyle: "italic",
        textColor: "#FFFFFF",
        textShadow: "2px 2px 4px rgba(0,0,0,0.8)", // Softer shadow
        animation: "scale",
        bgGradient: "linear-gradient(135deg, #000000 0%, #434343 100%)",
    },

    beast: {
        name: "Beast",
        tone: "bold",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "clamp(30px, 8vw, 60px)",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        highlightColor: "#FF0000", // Bright Red or could be Cyan #00FFFF
        highlightBg: "transparent",
        textColor: "#FFFFFF",
        textShadow: "0 4px 8px rgba(0,0,0,0.8)",
        animation: "bounce",
        bgGradient: "linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)",
    },

    stacked: {
        name: "Stacked",
        tone: "creative",
        fontFamily: "'Inter', sans-serif",
        fontSize: "clamp(24px, 6vw, 42px)",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "-0.02em",
        highlightColor: "#00FF00",
        highlightBg: "transparent",
        textColor: "#FFFFFF",
        textShadow: "2px 2px 10px rgba(0,0,0,0.8)",
        layout: "stacked", // Special flag
        lineHeight: 0.9,
        animation: "scaleIn",
        bgGradient: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
    },

    kinetic: {
        name: "Kinetic",
        tone: "dynamic",
        fontFamily: "'Outfit', sans-serif",
        fontSize: "clamp(26px, 7vw, 48px)",
        fontWeight: 700,
        textTransform: "none",
        letterSpacing: "-0.01em",
        highlightColor: "#FF00FF",
        highlightBg: "rgba(255, 0, 255, 0.1)",
        textColor: "#FFFFFF",
        textShadow: "0 4px 15px rgba(255,0,255,0.3)",
        animation: "kinetic", // Special animation
        bgGradient: "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
    },

    journal: {
        name: "Journal",
        tone: "aesthetic",
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(20px, 5vw, 36px)",
        fontWeight: 400,
        fontStyle: "italic",
        textTransform: "none",
        letterSpacing: "0.02em",
        highlightColor: "#C5A059", // Muted Gold
        highlightBg: "transparent",
        textColor: "rgba(255,255,255,0.9)",
        textShadow: "none",
        borderBottom: "1px solid rgba(197, 160, 89, 0.5)",
        animation: "fadeInBlur",
        bgGradient: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    },

    mixed: {
        name: "Mixed",
        tone: "storyteller",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "clamp(30px, 8vw, 52px)",
        fontWeight: 700,
        textTransform: "none",
        letterSpacing: "0px",
        highlightColor: "#FF3366",
        highlightBg: "transparent",
        textColor: "#FFFFFF",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        animation: "scaleIn",
        bgGradient: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)",
        wordFonts: ["'Caveat', cursive", "'Montserrat', sans-serif", "'Playfair Display', serif"]
    },

    trading: {
        name: "Day Trading",
        tone: "trading",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "clamp(24px, 6vw, 42px)",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        highlightColor: "#00FF00", // Ticker Green
        highlightBg: "rgba(0, 255, 0, 0.15)",
        textColor: "#FFFFFF",
        textShadow: "0 0 20px rgba(0,255,127,0.3)",
        animation: "scaleIn",
        bgGradient: "linear-gradient(135deg, #0D0D0D 0%, #1a1a1a 100%)",
        border: "1px solid rgba(255,255,255,0.1)"
    }
};

export const TONE_TO_STYLE = {
    calm: 'clean',
    energetic: 'viral',
    serious: 'modern',
    mixed: 'hinglish',
    hype: 'hormozi',
    bold: 'beast',
    creative: 'stacked',
    dynamic: 'kinetic',
    aesthetic: 'journal',
    trading: 'trading',
    storyteller: 'mixed'
};

export const FONTS = {
    montserrat: { name: 'Montserrat (Bold)', value: "'Montserrat', sans-serif", fontWeight: 800 },
    helvetica: { name: 'Helvetica (Clean)', value: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 },
    bebas: { name: 'Bebas Neue (Tall)', value: "'Bebas Neue', sans-serif", fontWeight: 400 },
    playfair: { name: 'Playfair (Elegant)', value: "'Playfair Display', serif", fontWeight: 600 },
    caveat: { name: 'Caveat (Handwritten)', value: "'Caveat', cursive", fontWeight: 700 },
    gotham: { name: 'Urban (Gotham-ish)', value: "'Montserrat', sans-serif", fontWeight: 900 } // Using Montserrat Black as Gotham alterntive
};

export const LAYOUT_MODES = {
    simple: { name: 'Simple (Standard)', value: 'simple' },
    mixed: { name: 'Mixed (Viral Cycle)', value: 'mixed' },
    stacked: { name: 'Stacked (Word Clusters)', value: 'stacked' }
};
