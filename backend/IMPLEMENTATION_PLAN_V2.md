# IMPLEMENTATION PLAN V2.0: Podcast Caption Stylist
## Core Goal: Professional "CapCut-like" Video Editor for Day Trading Content
**Objective:** Create a simplified, high-performance video editor tailored for short-form trading content (Reels/Shorts). Key focus on "Hinglish" transcription, rapid caption editing, and "Hormozi-style" animations.

---

## Phase 1: Core Foundation & Transcription (✅ Completed)
- [x] **Backend Server Setup** (FastAPI)
- [x] **Frontend Setup** (Vite + React)
- [x] **Video Upload & Handling** (`/transcribe` endpoint)
- [x] **Hinglish Support**:
    - [x] Added `initial_prompt` to Whisper for Romanized Hindi.
    - [x] Force `language='en'` to prevent Devanagari script output.

## Phase 2: The "Editor" UI Overhaul (✅ Completed)
- [x] **3-Pane Layout Implementation**:
    - **Left Panel (Assets)**: Video import, project metadata.
    - **Center Panel (Preview)**: `PhonePreview` with drag-and-drop captions.
    - **Right Panel (Inspector)**: comprehensive style controls, segment editing.
    - **Bottom Panel (Timeline)**: Zoomable `Timeline` with audio waveform.
- [x] **Component Cleanup**:
    - Removed 'Viral Content Generator' (distraction).
    - Removed 'Transcript Input' (focus on video-first workflow).
    - Renamed/Refactors `PhonePreview` to `VideoPreview` context.

## Phase 3: Advanced Trading Features (✅ Completed)
**Goal:** Specific features for the "Day Trading" niche.
- [x] **Smart Ticker Detection**:
    - Auto-highlight keywords like "BULLISH", "BEARISH", "LONG", "SHORT".
    - Detect stock tickers ($TSLA, NIFTY) and format them green/red.
- [x] **Dynamic Animations**:
    - "Pop" animation for key trading terms.
    - "Typewriter" effect for rapid-fire speech.
- [x] **Overlay Graphics**:
    - Add capability to overlay simple stock charts (mockup or image) via ffmpeg/remotion.

## Phase 4: Export & Performance Optimization (✅ Completed)
- [x] **Basic Export**: `ffmpeg` rendering of captions + video.
- [x] **Advanced Export**:
    - [x] 60fps rendering option.
    - [x] Smart Style & Overlay rendering enabled.
- [ ] **Client-Side Rendering (Optional)**:
    - Explore `@remotion/player` for true client-side preview without backend roundtrips for every text change.

---

## Technical Stack & Architecture
- **Frontend**: React 18, Vite, CSS Grid (No Tailwind), Canvas API (Waveforms).
- **Backend**: Python 3.10+, FastAPI, OpenAI Whisper (Local), FFmpeg.
- **State Management**: React `useState` + `useContext` (Migrations to Zustand if complexity grows).

## User Workflow (The "Happy Path")
1.  **Import**: Drag & Drop video file.
2.  **Transcribe**: Auto-runs Whisper with "Hinglish" prompt.
3.  **Edit**:
    - Review Timeline.
    - Click caption -> Edit text in Inspector.
    - Drag caption on Video Preview to position.
    - Apply "Trading Hype" preset style.
4.  **Export**: Click "Render Video" -> Download MP4.

## Known Issues / Debts
- `PhonePreview` drag logic relies on local state syncing; ensure robust two-way binding.
- Large video files (>500MB) need chunked upload support (Future).
