import React, { useState, useEffect, useRef, useCallback } from 'react';
import VideoPreview from './components/VideoPreview';
import StyleSelector from './components/StyleSelector';
import Timeline from './components/Timeline';
import Inspector from './components/Inspector';

import { generateCaptions, getStyleFromTone } from './utils/captionUtils';
import { parseTranscript } from './utils/transcriptParser';
import { detectTradingTerms, getSmartStyle } from './utils/tradingTerms';
import { CAPTION_STYLES } from './constants/styles';

function App() {
  // --- State Management ---
  const [projectTitle, setProjectTitle] = useState('Untitled Project');
  const [rawTranscript, setRawTranscript] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [emphasisData, setEmphasisData] = useState(null);

  // Style State
  const [selectedFont, setSelectedFont] = useState('montserrat');
  const [selectedLayout, setSelectedLayout] = useState('simple');
  const [aspectRatio, setAspectRatio] = useState('9:16'); // New Aspect Ratio State

  // Edit State
  const [generatedCaptions, setGeneratedCaptions] = useState(null);
  const [captionOffsets, setCaptionOffsets] = useState({});
  const [captionOverrides, setCaptionOverrides] = useState({});
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(null);

  // Playback State
  const [previewTime, setPreviewTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);

  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Export Settings
  const [isHighFps, setIsHighFps] = useState(false);

  // Overlays State (New)
  const [overlays, setOverlays] = useState([]);

  // Toast State
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Animation Ref
  const animationRef = useRef(null);

  // History (Simplified for now, can perform Undo/Redo)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // --- History Handlers ---
  const saveToHistory = useCallback((newState, label = "Change") => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      const entry = { ...newState, label, timestamp: Date.now() };
      const updated = [...newHistory.slice(-49), entry];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [historyIndex]);

  const jumpToHistory = useCallback((index) => {
    if (index < 0 || index >= history.length) return;
    const state = history[index];
    setHistoryIndex(index);
    setGeneratedCaptions({
      captions: state.captions,
      style: state.style
    });
    setCaptionOffsets(state.offsets || {});
    setCaptionOverrides(state.overrides || {});
    setOverlays(state.overlays || []); // Restore overlays
  }, [history]);

  const undo = () => { if (historyIndex > 0) jumpToHistory(historyIndex - 1); };
  const redo = () => { if (historyIndex < history.length - 1) jumpToHistory(historyIndex + 1); };

  // --- Effects ---

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(prev => !prev); }
      else if (e.key === 'j' || e.key === 'J') setPreviewTime(prev => Math.max(0, prev - 1));
      else if (e.key === 'l' || e.key === 'L') {
        const last = generatedCaptions?.captions?.[generatedCaptations.captions.length - 1];
        setPreviewTime(prev => Math.min(last ? last.end : 60, prev + 1));
      }
      else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault(); e.shiftKey ? redo() : undo();
      }
      else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault(); redo();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [generatedCaptions, undo, redo]); // Add dependencies

  // Animation Loop removed to prevent conflict with VideoPlayer's onTimeUpdate
  // The VideoPlayer component will drive the previewTime state via onTimeUpdate event

  // --- Simulated Progress for Export ---
  useEffect(() => {
    let interval;
    if (isRendering) {
      interval = setInterval(() => {
        setRenderProgress(prev => {
          // If we are at 10% (start), jump to 20
          if (prev < 20) return prev + 5;
          // If we are waiting for backend (usually stalls at 50), creep up to 90
          if (prev >= 50 && prev < 90) {
            return prev + Math.random() * 2; // Random small increments
          }
          return prev;
        });
      }, 800);
    } else {
      setRenderProgress(0);
    }
    return () => clearInterval(interval);
  }, [isRendering]);


  // --- Action Handlers ---

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setVideoBlob(file);
    setVideoUrl(URL.createObjectURL(file));
    setProjectTitle(file.name.replace(/\.[^/.]+$/, ""));

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Transcribe
      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription Failed");
      const responseData = await response.json();
      const transcriptData = responseData.captions || [];

      setTranscript(transcriptData);
      setRawTranscript(JSON.stringify(transcriptData, null, 2));

      // Auto-Analyze Emphasis
      const scriptText = transcriptData.map(w => w.word).join(' ');
      try {
        const emphasisRes = await fetch('http://localhost:8000/analyze-emphasis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script: scriptText })
        });
        const emphasisJson = await emphasisRes.json();
        setEmphasisData(emphasisJson.emphasis || []);
      } catch (err) { console.warn("Emphasis analysis failed", err); }

      // Generate
      generateCaptionsFromTranscript(transcriptData, selectedFont, selectedLayout);

    } catch (error) {
      console.error(error);
      showToast("Failed to transcribe. Check backend connection.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateCaptionsFromTranscript = (tData, fontKey, layoutMode) => {
    // 1. Get Base Style logic
    // We construct a 'style' object dynamically based on Font & Layout
    import('./constants/styles').then(({ FONTS, CAPTION_STYLES }) => {
      const fontConfig = FONTS[fontKey] || FONTS.montserrat;

      // Base styling properties
      const baseStyle = {
        ...CAPTION_STYLES.modern, // Start with modern defaults
        fontFamily: fontConfig.value,
        fontWeight: fontConfig.fontWeight,
        layout: layoutMode === 'stacked' ? 'stacked' : 'default',
        name: `${fontConfig.name} - ${layoutMode}`
      };

      const options = {
        layout: layoutMode === 'stacked' ? 'stacked' : 'default',
        emphasisData: emphasisData
      };

      let captions = generateCaptions(tData, options);

      // 2. Apply "Mixed" (Storyteller) Logic if selected
      if (layoutMode === 'mixed') {
        // Cycle: Script -> Selected Font -> Serif
        const fonts = ["'Caveat', cursive", fontConfig.value, "'Playfair Display', serif"];
        captions = captions.map(cap => {
          const words = cap.words.map((w, i) => ({
            ...w,
            smartStyle: {
              ...w.smartStyle,
              fontFamily: fonts[i % fonts.length],
              fontStyle: (i % fonts.length === 2 || fonts[i % 3].includes('Playfair')) ? 'italic' : 'normal',
              fontWeight: (i % fonts.length === 1) ? fontConfig.fontWeight : 700,
              fontSize: (i % fonts.length === 0) ? '1.2em' : '1em' // Make script slightly larger
            }
          }));
          return { ...cap, words };
        });

        // Update style to reflect mixed nature
        baseStyle.animation = 'scaleIn';
      }

      const newState = {
        style: baseStyle, // We now pass the full style object, not just a name
        captions
      };

      setGeneratedCaptions(newState);
      saveToHistory({ ...newState, offsets: {}, overrides: {} }, "Generate Captions");
      setCaptionOffsets({});
      setCaptionOverrides({});
      setPreviewTime(0);
      setIsPlaying(true);
    });
  };

  // Re-generate when Style changes
  const handleStyleChange = (newFont, newLayout) => {
    setSelectedFont(newFont);
    setSelectedLayout(newLayout);
    if (transcript.length > 0) {
      generateCaptionsFromTranscript(transcript, newFont, newLayout);
    }
  };

  const handleUpdateCaption = (index, newData) => {
    setGeneratedCaptions(prev => {
      const newCaptions = [...prev.captions];
      newCaptions[index] = newData;
      const newState = { ...prev, captions: newCaptions };
      saveToHistory({ ...newState, offsets: captionOffsets, overrides: captionOverrides }, "Update Caption");
      return newState;
    });
  };

  const handleUpdateOverride = (index, data) => {
    setCaptionOverrides(prev => {
      const newState = { ...prev, [index]: data };
      saveToHistory({ ...generatedCaptions, offsets: captionOffsets, overrides: newState }, "Style Override");
      return newState;
    });
  };

  const handleDeleteCaption = (index) => {
    setGeneratedCaptions(prev => {
      const newCaptions = prev.captions.filter((_, i) => i !== index);
      const newState = { ...prev, captions: newCaptions };
      saveToHistory({ ...newState, offsets: captionOffsets, overrides: captionOverrides }, "Delete Caption");
      return newState;
    });
  };

  const handleSplitCaption = (time) => {
    setGeneratedCaptions(prev => {
      const index = prev.captions.findIndex(c => time > c.start && time < c.end);
      if (index === -1) return prev;

      const caption = prev.captions[index];
      const newCaptions = [...prev.captions];

      const firstHalf = { ...caption, end: time };
      const secondHalf = { ...caption, start: time };

      newCaptions.splice(index, 1, firstHalf, secondHalf);
      const newState = { ...prev, captions: newCaptions };
      saveToHistory({ ...newState, offsets: captionOffsets, overrides: captionOverrides }, "Split Caption");
      return newState;
    });
  };

  const handleDragEnd = (newOffsets) => {
    setCaptionOffsets(newOffsets); // Update local state
    saveToHistory({ ...generatedCaptions, offsets: newOffsets, overrides: captionOverrides, overlays }, "Move Caption");
  };

  const handleAddOverlay = () => {
    const newOverlay = {
      id: Date.now(),
      type: 'chart',
      // Placeholder chart image
      src: 'https://placehold.co/300x200/111/FFF?text=TSLA+Chart+Mockup',
      x: 50,
      y: 200,
      scale: 1,
      opacity: 0.9,
      width: 300,
      height: 200
    };
    setOverlays(prev => {
      const newState = [...prev, newOverlay];
      saveToHistory({ ...generatedCaptions, offsets: captionOffsets, overrides: captionOverrides, overlays: newState }, "Add Chart");
      return newState;
    });
  };

  const handleAddTextOverlay = () => {
    const newOverlay = {
      id: Date.now(),
      type: 'text',
      text: 'Double Click to Edit',
      x: 100,
      y: 300,
      fontSize: 40,
      color: '#ffffff',
      fontWeight: 'bold',
      scale: 1,
      opacity: 1
    };
    setOverlays(prev => {
      const newState = [...prev, newOverlay];
      saveToHistory({ ...generatedCaptions, offsets: captionOffsets, overrides: captionOverrides, overlays: newState }, "Add Text");
      return newState;
    });
  };

  const handleUpdateOverlay = (id, updates) => {
    setOverlays(prev => {
      const newState = prev.map(o => o.id === id ? { ...o, ...updates } : o);
      return newState;
    });
  };

  // Update drag end to save history
  const handleOverlayDragEnd = (id, x, y) => {
    setOverlays(prev => {
      const newState = prev.map(o => o.id === id ? { ...o, x, y } : o);
      saveToHistory({ ...generatedCaptions, offsets: captionOffsets, overrides: captionOverrides, overlays: newState }, "Move Overlay");
      return newState;
    });
  };

  const handleSeek = (time) => {
    setPreviewTime(time);
    setIsPlaying(false);
  };

  // Export
  const handleRenderVideo = async () => {
    if (!videoBlob || !generatedCaptions) return alert("Nothing to render!");
    setIsRendering(true);
    setRenderProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', videoBlob);
      formData.append('captions_json', JSON.stringify(generatedCaptions.captions));

      let style = generatedCaptions.style;
      // If it's just a string name (legacy), look it up
      if (typeof style === 'string') {
        style = CAPTION_STYLES[style] || CAPTION_STYLES.modern;
        style.name = generatedCaptions.style;
      }
      // If missing entirely
      if (!style) style = CAPTION_STYLES.modern;

      formData.append('style_json', JSON.stringify(style));
      formData.append('offsets_json', JSON.stringify(captionOffsets));
      formData.append('overrides_json', JSON.stringify(captionOverrides));
      formData.append('overlays_json', JSON.stringify(overlays));
      formData.append('fps', isHighFps ? '60' : '30');
      // Pass aspect ratio if backend supports it in future
      // formData.append('aspect_ratio', aspectRatio);

      setRenderProgress(50);
      console.log("Sending export request...", formData);
      alert(`Starting export! Video size: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`);

      const res = await fetch('http://localhost:8000/render', { method: 'POST', body: formData });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server Error (${res.status}): ${errText}`);
      }

      setRenderProgress(100);

      // Get saved path from header
      const savedPath = res.headers.get("X-Saved-Path");
      if (savedPath) {
        alert(`SUCCESS! Video saved to your Desktop:\n${savedPath}`);
      } else {
        alert("Export complete! Checking download...");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectTitle}_styled.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Render Error: " + e.message);
    } finally {
      setIsRendering(false);
      setRenderProgress(0);
    }
  };


  // --- Layout Render (VEED Inspired) ---
  return (
    <div style={{
      height: '100vh',
      display: 'grid',
      gridTemplateRows: '56px 1fr 300px', // Header, Main, Timeline
      gridTemplateColumns: '280px 1fr 320px', // Left Sidebar, Canvas, Right Inspector
      background: '#121212',
      color: '#fff',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* 1. Header */}
      <header style={{
        gridColumn: '1 / -1',
        background: '#181818',
        borderBottom: '1px solid #2A2A2A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)', borderRadius: '6px' }}></div>
          <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em' }}>VEED-LIKE</span>

          <div style={{ height: '20px', width: '1px', background: '#333', margin: '0 10px' }}></div>

          <span style={{ fontSize: '13px', color: '#888' }}>{projectTitle}</span>
        </div>

        {/* Center: Aspect Ratio & Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            style={{
              background: '#222',
              border: '1px solid #333',
              color: '#ddd',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="9:16">9:16 (Shorts/Reels)</option>
            <option value="16:9">16:9 (YouTube)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="4:5">4:5 (Portrait)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={undo} title="Undo (Ctrl+Z)" style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer' }}>↩</button>
          <button onClick={redo} title="Redo (Ctrl+Y)" style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer' }}>↪</button>

          <button
            onClick={handleRenderVideo}
            disabled={isRendering || !generatedCaptions}
            style={{
              background: isRendering ? '#333' : '#fff',
              border: 'none',
              color: isRendering ? '#888' : '#000',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13px', fontWeight: 600,
              cursor: isRendering ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {isRendering ? `Exporting ${renderProgress}%` : 'Export Video'}
            {!isRendering && <span style={{ fontSize: '10px' }}>↗</span>}
          </button>
        </div>
      </header>

      {/* 2. Left Sidebar: Assets & Tools */}
      <aside style={{
        gridRow: '2 / 3',
        gridColumn: '1 / 2',
        background: '#181818',
        borderRight: '1px solid #2A2A2A',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Tab Navigation (Phony) */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2A2A2A' }}>
          <button style={{ flex: 1, padding: '12px', background: '#1E1E1E', color: '#fff', border: 'none', borderBottom: '2px solid #0072FF', fontSize: '12px', fontWeight: 600 }}>Assets</button>
          <button style={{ flex: 1, padding: '12px', background: 'transparent', color: '#666', border: 'none', fontSize: '12px' }}>Elements</button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>

          {/* Upload Section */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', marginBottom: '10px' }}>Media</h3>
            <div style={{
              border: '2px dashed #333', borderRadius: '8px', padding: '24px',
              textAlign: 'center', background: '#1E1E1E', cursor: 'pointer', transition: 'border-color 0.2s'
            }}>
              <input type="file" id="upload-video" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
              <label htmlFor="upload-video" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📤</span>
                <span style={{ fontSize: '12px', color: '#bbb', fontWeight: 500 }}>
                  {isProcessing ? 'Processing Video...' : 'Upload Video'}
                </span>
              </label>
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', marginBottom: '10px' }}>Add Elements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={handleAddTextOverlay}
                style={{
                  padding: '12px', background: '#222', border: '1px solid #333', borderRadius: '8px',
                  color: '#eee', fontSize: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                }}
              >
                <span style={{ fontSize: '16px' }}>T</span>
                Text
              </button>
              <button
                onClick={handleAddOverlay}
                style={{
                  padding: '12px', background: '#222', border: '1px solid #333', borderRadius: '8px',
                  color: '#eee', fontSize: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                }}
              >
                <span style={{ fontSize: '16px' }}>🖼️</span>
                Image
              </button>
            </div>
          </div>

          {/* List Layer Items */}
          {overlays.length > 0 && (
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', marginBottom: '10px', marginTop: '10px' }}>Layers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {overlays.map((o, i) => (
                  <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#1E1E1E', borderRadius: '6px', fontSize: '12px' }}>
                    <span>{o.type === 'text' ? 'T' : '🖼️'}</span>
                    <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{o.type === 'text' ? o.text : `Image ${i + 1}`}</span>
                    <button onClick={() => setOverlays(ov => ov.filter(x => x.id !== o.id))} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </aside>

      {/* 3. Center Panel: Canvas */}
      <main style={{
        gridRow: '2 / 3',
        gridColumn: '2 / 3',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Grid Background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>

        {videoUrl ? (
          <VideoPreview
            generatedCaptions={generatedCaptions}
            previewTime={previewTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            setPreviewTime={setPreviewTime}
            videoUrl={videoUrl}
            captionOffsets={captionOffsets}
            setCaptionOffsets={handleDragEnd}
            captionOverrides={captionOverrides}
            overlays={overlays}
            onUpdateOverlay={handleUpdateOverlay}
            onOverlayDragEnd={handleOverlayDragEnd}
            aspectRatio={aspectRatio}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#444' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎬</div>
            <p style={{ fontWeight: 600 }}>Start by uploading a video</p>
            <p style={{ fontSize: '12px' }}>or drag and drop here</p>
          </div>
        )}
      </main>

      {/* 4. Right Panel: Inspector */}
      <aside style={{
        gridRow: '2 / 3',
        gridColumn: '3 / 4',
        background: '#181818',
        borderLeft: '1px solid #2A2A2A',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {selectedCaptionIndex !== null && generatedCaptions ? (
            <>
              <div style={{ padding: '20px', borderBottom: '1px solid #2A2A2A' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', marginBottom: '15px' }}>Caption Style</h3>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: '15px' }}>Global Style</h3>
                <StyleSelector
                  selectedFont={selectedFont} setSelectedFont={(f) => handleStyleChange(f, selectedLayout)}
                  selectedLayout={selectedLayout} setSelectedLayout={(l) => handleStyleChange(selectedFont, l)}
                />
              </div>
              <Inspector
                selectedCaption={{
                  caption: generatedCaptions.captions[selectedCaptionIndex],
                  index: selectedCaptionIndex,
                  override: captionOverrides[selectedCaptionIndex] || {}
                }}
                onUpdate={handleUpdateCaption}
                onUpdateOverride={handleUpdateOverride}
                onSeek={handleSeek}
                onSplit={handleSplitCaption}
                onDelete={handleDeleteCaption}
                previewTime={previewTime}
              />
            </>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#444' }}>
              <p style={{ fontSize: '13px' }}>Select an element on the timeline or canvas to edit properties.</p>
            </div>
          )}
        </div>
      </aside>

      {/* 5. Bottom Panel: Timeline */}
      <section style={{
        gridRow: '3 / 4',
        gridColumn: '1 / 4', // Spans full width
        background: '#151515',
        borderTop: '1px solid #2A2A2A',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '8px 20px', borderBottom: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Timeline</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>{isPlaying ? '⏸' : '▶'}</button>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#00C6FF' }}>{previewTime.toFixed(2)}s</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          {generatedCaptions ? (
            <Timeline
              captions={generatedCaptions.captions}
              previewTime={previewTime}
              videoUrl={videoUrl}
              onSeek={handleSeek}
              onUpdateCaption={handleUpdateCaption}
              onDeleteCaption={handleDeleteCaption}
              onSplitCaption={handleSplitCaption}
              selectedCaptionIndex={selectedCaptionIndex}
              onSelectCaption={setSelectedCaptionIndex}
            />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '12px' }}>
              Upload a video to see the timeline
            </div>
          )}
        </div>
      </section>

      {/* Loading Overlay (Transcription) */}
      {isProcessing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #333', borderTopColor: '#00C6FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginTop: '20px' }}>Transcribing Video...</h2>
          <p style={{ color: '#666', fontSize: '13px', marginTop: '5px' }}>This happens locally on your backend.</p>
        </div>
      )}

      {/* Export Progress Overlay */}
      {isRendering && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Spinner */}
          <div style={{ width: '50px', height: '50px', border: '4px solid #333', borderTopColor: '#00C6FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>

          {/* Progress Text */}
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginTop: '24px' }}>{renderProgress}%</h2>

          {/* Status Message */}
          <h3 style={{ color: '#ccc', fontSize: '16px', fontWeight: 500, marginTop: '8px' }}>
            {renderProgress < 30 ? 'Preparing Assets...' :
              renderProgress < 60 ? 'Rendering Video (FFmpeg)...' :
                renderProgress < 90 ? 'Encoding Final Output...' :
                  'Saving to Desktop...'}
          </h3>

          {/* Progress Bar Visual */}
          <div style={{ width: '300px', height: '6px', background: '#333', borderRadius: '3px', marginTop: '20px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#00C6FF', width: `${renderProgress}%`, transition: 'width 0.3s ease' }}></div>
          </div>

          <p style={{ color: '#666', fontSize: '12px', marginTop: '12px' }}>Please do not close this window.</p>
        </div>
      )}

    </div>
  );
}

// --- Components ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'error' ? '#FF4B4B' : '#00C6FF';
  const icon = type === 'error' ? '⚠️' : '✅';

  return (
    <div style={{
      position: 'fixed', bottom: '30px', right: '30px',
      background: '#1E1E1E', borderLeft: `4px solid ${bg}`,
      padding: '16px 24px', borderRadius: '8px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', gap: '12px',
      zIndex: 10000, animation: 'slideIn 0.3s ease-out',
      color: '#fff', fontSize: '14px', maxWidth: '400px'
    }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 500, margin: 0 }}>{message}</p>
        {type === 'success' && <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Click to dismiss</p>}
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>×</button>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
};

export default App;
