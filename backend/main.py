from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import whisper
import os
import shutil
import uvicorn
from tempfile import NamedTemporaryFile
import yt_dlp
from openai import OpenAI
import json
import subprocess
import re


import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend_debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ffmpeg_path = r"C:\Users\Admin\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin"
if os.path.exists(ffmpeg_path):
    os.environ["PATH"] += os.pathsep + ffmpeg_path
    logger.info(f"Added ffmpeg to PATH: {ffmpeg_path}")
else:
    logger.warning("Warning: Could not find ffmpeg path automatically. Ensure it is installed and in PATH.")

logger.info("Loading Whisper model...")
model = whisper.load_model("base")
logger.info("Whisper model loaded!")


# Initialize OpenAI client (uses OPENAI_API_KEY env var)
openai_client = None
if os.environ.get("OPENAI_API_KEY"):
    openai_client = OpenAI()
    print("OpenAI client initialized!")
else:
    print("Warning: OPENAI_API_KEY not set. Content generation will use fallback mode.")


@app.post("/transcribe")
@limiter.limit("10/minute")
async def transcribe_video(request: Request, file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    print(f"Received file: {file.filename}")

    # Save uploaded file temporarily
    temp_file = NamedTemporaryFile(delete=False, suffix=".mp4") # Or detect extension
    try:
        with temp_file as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"Saved temp file to: {temp_file.name}")
        
        # Force English to get Hinglish (romanized Hindi) instead of Urdu/Devanagari script
        # The prompt helps steer it towards Romanized transcription
        result = model.transcribe(
            temp_file.name, 
            word_timestamps=True, 
            language='en',
            initial_prompt="The audio is in Hinglish, a mix of Hindi and English. Transcribe in Roman script."
        )
        
        # Format for our React app: [{word, start, end, confidence}, ...]
        formatted_captions = []
        
        for segment in result["segments"]:
            for word in segment["words"]:
                formatted_captions.append({
                    "word": word["word"].strip(),
                    "start": word["start"],
                    "end": word["end"],
                    "confidence": word.get("probability", 1.0)
                })
        
        print(f"Transcription complete. Found {len(formatted_captions)} words.")
        
        # Get video info
        video_info = get_video_info(temp_file.name)
        
        return {
            "captions": formatted_captions,
            "width": video_info["width"],
            "height": video_info["height"],
            "duration": video_info["duration"]
        }

    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Cleanup
        if os.path.exists(temp_file.name):
            os.remove(temp_file.name)
            print("Temp file cleaned up")


@app.post("/transcribe-url")
@limiter.limit("10/minute")
async def transcribe_from_url(request: Request, data: dict):
    """Download video from URL (YouTube/Instagram) and transcribe it."""
    url = data.get("url", "").strip()
    
    if not url:
        raise HTTPException(status_code=400, detail="No URL provided")
    
    print(f"Processing URL: {url}")
    
    # yt-dlp options for audio extraction
    temp_audio_path = None
    try:
        # Create temp file for audio
        temp_audio = NamedTemporaryFile(delete=False, suffix=".mp3")
        temp_audio_path = temp_audio.name
        temp_audio.close()
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': temp_audio_path.replace('.mp3', ''),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'quiet': True,
            'no_warnings': True,
        }
        
        # Download audio
        print("Downloading audio from URL...")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_title = info.get('title', 'Untitled')
            video_duration = info.get('duration', 0)
        
        # The actual file might have .mp3 extension appended
        actual_path = temp_audio_path
        if not os.path.exists(actual_path) and os.path.exists(temp_audio_path.replace('.mp3', '') + '.mp3'):
            actual_path = temp_audio_path.replace('.mp3', '') + '.mp3'
        
        print(f"Downloaded: {video_title} ({video_duration}s)")
        print(f"Audio saved to: {actual_path}")
        
        # Transcribe with Whisper
        print("Transcribing audio...")
        result = model.transcribe(actual_path, word_timestamps=True, language='en')
        
        # Format captions
        formatted_captions = []
        full_text = ""
        
        for segment in result["segments"]:
            full_text += segment["text"] + " "
            for word in segment["words"]:
                formatted_captions.append({
                    "word": word["word"].strip(),
                    "start": word["start"],
                    "end": word["end"],
                    "confidence": word.get("probability", 1.0)
                })
        
        print(f"Transcription complete. Found {len(formatted_captions)} words.")
        
        return {
            "title": video_title,
            "duration": video_duration,
            "transcript": formatted_captions,
            "fullText": full_text.strip()
        }
        
    except yt_dlp.utils.DownloadError as e:
        print(f"Download error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Could not download video: {str(e)}")
    except Exception as e:
        print(f"Error processing URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp files
        if temp_audio_path:
            for ext in ['', '.mp3']:
                path = temp_audio_path.replace('.mp3', '') + ext
                if os.path.exists(path):
                    os.remove(path)
                    print(f"Cleaned up: {path}")


@app.post("/generate-content")
@limiter.limit("10/minute")
async def generate_viral_content(request: Request, data: dict):
    """Generate viral content (titles, hashtags, captions, trends) from transcript."""
    script = data.get("script", "").strip()
    content_types = data.get("types", ["title", "hashtags", "captions", "trends"])
    
    if not script:
        raise HTTPException(status_code=400, detail="No script provided")
    
    print(f"Generating content for script ({len(script)} chars)")
    
    result = {}
    
    if openai_client:
        # Use OpenAI for generation
        try:
            prompt = f"""You are a viral content expert for social media. Based on this video script, generate the following:

SCRIPT:
{script}

Generate:
1. TITLE: A catchy, attention-grabbing title (max 60 chars)
2. HASHTAGS: 10-15 relevant trending hashtags for maximum reach
3. CAPTIONS: 3 different creative captions for social media posts
4. TRENDS: 3 content ideas or trends inspired by this script

Respond in this exact JSON format:
{{
    "title": "Your catchy title here",
    "hashtags": ["#hashtag1", "#hashtag2", ...],
    "captions": ["Caption 1...", "Caption 2...", "Caption 3..."],
    "trends": ["Trend idea 1...", "Trend idea 2...", "Trend idea 3..."]
}}"""

            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            # Parse JSON from response
            result = json.loads(content)
            
        except Exception as e:
            print(f"OpenAI error: {str(e)}")
            # Fall through to fallback
            result = generate_fallback_content(script)
    else:
        # Fallback: Generate basic content without AI
        result = generate_fallback_content(script)
    
    # Filter to only requested types
    filtered_result = {k: v for k, v in result.items() if k in content_types}
    
    print(f"Generated content: {list(filtered_result.keys())}")
    return filtered_result


@app.post("/analyze-emphasis")
@limiter.limit("5/minute")
async def analyze_emphasis(request: Request, data: dict):
    """Analyze a transcript to find words that should be emphasized/highlighted."""
    script = data.get("script", "").strip()
    
    if not script:
        raise HTTPException(status_code=400, detail="No script provided")
    
    if not openai_client:
        # Fallback: simple heuristic for emphasis
        words = script.split()
        emphasis = []
        for i, word in enumerate(words):
            clean_word = word.strip('.,!?').lower()
            score = 0
            if len(clean_word) > 7: score += 1
            if any(p in clean_word for p in ["love", "fear", "money", "power", "truth", "important"]): score += 2
            if i % 8 == 0: score += 1 # Random emphasis for rhythm
            
            if score > 0:
                emphasis.append({"word": word, "score": score})
        
        return {"emphasis": emphasis}

    try:
        prompt = f"""Identify the most emotionally impactful or key words in this script that should be highlighted in a video. 
Special focus: Identify financial tickers (e.g., TSLA, BTC), price levels ($500, 10k), and trading jargon (bullish, resistance).
For each word, provide an emphasis score from 1-5 where 5 is maximum emotional peak or a clear financial signal.

SCRIPT:
{script}

Respond in this exact JSON format:
{{
    "emphasis": [
        {{"word": "word1", "score": 5}},
        {{"word": "word2", "score": 3}}
    ]
}}"""

        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": "You are a viral video editor."},
                      {"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        print(f"Emphasis analysis error: {str(e)}")
        return {"emphasis": []}


def get_video_info(path):
    """Extract width, height, and duration using ffprobe."""
    try:
        cmd = [
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=width,height,duration", "-of", "json", path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        info = json.loads(result.stdout)
        stream = info['streams'][0]
        return {
            "width": int(stream['width']),
            "height": int(stream['height']),
            "duration": float(stream.get('duration', 0))
        }
    except Exception as e:
        print(f"Error getting video info: {e}")
        return {"width": 1080, "height": 1920, "duration": 0} # Fallback


def generate_fallback_content(script: str) -> dict:
    """Generate basic content without AI API."""
    words = script.split()
    key_words = [w.strip('.,!?').lower() for w in words if len(w) > 4][:10]
    
    return {
        "title": f"🔥 {' '.join(words[:6])}..." if len(words) > 6 else script[:60],
        "hashtags": [f"#{w}" for w in key_words[:10]] + ["#viral", "#trending", "#fyp", "#reels", "#shorts"],
        "captions": [
            f"💯 {script[:100]}...",
            f"This hit different 🎯 {script[:80]}",
            f"POV: {script[:90]}... 🔥"
        ],
        "trends": [
            "Create a reaction video to this content",
            "Make a duet/stitch with your own take",
            "Turn this into a longer explainer video"
        ]
    }


@app.post("/render")
async def render_video(
    file: UploadFile = File(...),
    captions_json: str = Form(...),
    style_json: str = Form(...),
    offsets_json: str = Form(...),
    overrides_json: str = Form(None),
    overlays_json: str = Form(None),
    fps: str = Form("30"),
):
    """Render video with burned-in captions and overlays using FFmpeg."""
    try:
        logger.info("Starting video render...")
        captions = json.loads(captions_json)
        style_config = json.loads(style_json)
        offsets = json.loads(offsets_json)
        overrides = json.loads(overrides_json) if overrides_json else {}
        overlays = json.loads(overlays_json) if overlays_json else []

        # Save uploaded file temporarily
        input_temp = NamedTemporaryFile(delete=False, suffix=".mp4")
        with input_temp as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        output_path = input_temp.name.replace(".mp4", "_rendered.mp4")
        ass_path = input_temp.name.replace(".mp4", ".ass")

        # Create ASS file
        video_info = get_video_info(input_temp.name)
        create_ass_file(captions, style_config, offsets, overrides, ass_path, video_info)

        # Build FFmpeg command with complex filters for overlays
        # 1. Start with input video
        ffmpeg_cmd = ["ffmpeg", "-y", "-i", input_temp.name]
        
        # 2. Add overlay inputs
        filter_complex = []
        overlay_inputs = []
        
        # Base video is stream [0:v]
        current_stream = "[0:v]"
        
        for i, overlay in enumerate(overlays):
            try:
                # 2a. Download/Get image
                img_url = overlay.get('src')
                if not img_url: continue

                # Create temp file for image
                suffix = ".png" if ".png" in img_url else ".jpg"
                temp_img = NamedTemporaryFile(delete=False, suffix=suffix)
                temp_img.close()
                
                # Download
                if "placehold.co" in img_url:
                    # Direct download
                    subprocess.run(["curl", "-s", "-o", temp_img.name, img_url], check=True)
                else:
                    # Try using yt-dlp or requests for other URLs (simplified for now with curl)
                    subprocess.run(["curl", "-s", "-o", temp_img.name, img_url], check=True)

                # Add as input
                ffmpeg_cmd.extend(["-i", temp_img.name])
                overlay_inputs.append(temp_img.name)
                
                # 2b. Build filter
                # input index is i+1 (0 is video)
                overlay_idx = i + 1
                
                # Frontend video display width is 280px (PhonePreview container max-width)
                vid_w = video_info.get('width', 1080)
                scale_factor = vid_w / 280.0
                
                # Calculate pos and size
                x = int(overlay.get('x', 0) * scale_factor)
                y = int(overlay.get('y', 0) * scale_factor)
                w = int(overlay.get('width', 300) * scale_factor)
                
                # Scale input stream
                scaled_stream = f"[img{i}]"
                filter_complex.append(f"[{overlay_idx}:v]scale={w}:-1{scaled_stream}")
                
                # Overlay on current stream
                out_stream = f"[v{i+1}]"
                filter_complex.append(f"{current_stream}{scaled_stream}overlay={x}:{y}{out_stream}")
                
                current_stream = out_stream
                
            except Exception as e:
                logger.error(f"Failed to process overlay {i}: {e}")

        # 3. Apply subtitles filter to the LAST video stream
        # Escape path for Windows FFmpeg filter
        escaped_ass_path = ass_path.replace("\\", "/").replace(":", "\\:")
        
        # Configure fonts directory
        fonts_dir = os.path.join(os.getcwd(), "fonts")
        escaped_fonts_dir = fonts_dir.replace("\\", "/").replace(":", "\\:")
        
        logger.info(f"Escaped ASS Path: {escaped_ass_path}")
        logger.info(f"Escaped Fonts Dir: {escaped_fonts_dir}")

        if filter_complex:
            # Join all filters
            full_filter = ";".join(filter_complex)
            # Append subtitle filter to the chain with fontsdir
            full_filter += f";{current_stream}subtitles='{escaped_ass_path}:fontsdir={escaped_fonts_dir}'[outv]"
            
            ffmpeg_cmd.extend([
                "-filter_complex", full_filter,
                "-map", "[outv]", 
                "-map", "0:a", # Map audio from original
                "-r", fps,  # Set Output FPS
                "-c:v", "libx264", "-preset", "fast", "-crf", "23",
                "-c:a", "copy", 
                output_path
            ])
        else:
            # Simple render (just subtitles)
            ffmpeg_cmd.extend([
                "-vf", f"subtitles='{escaped_ass_path}:fontsdir={escaped_fonts_dir}'",
                "-r", fps, # Set Output FPS
                "-c:a", "copy", 
                output_path
            ])
        
        logger.info(f"Running FFmpeg: {' '.join(ffmpeg_cmd)}")
        process = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        
        if process.returncode != 0:
            logger.error(f"FFmpeg Error: {process.stderr}")
            raise HTTPException(status_code=500, detail=f"FFmpeg failed: {process.stderr}")

        # --- AUTO-SAVE TO DESKTOP ---
        try:
            home = os.path.expanduser("~")
            desktop_paths = [
                os.path.join(home, 'Desktop'),
                os.path.join(home, 'OneDrive', 'Desktop'), # Common on Windows 11
            ]
            
            target_path = None
            for dp in desktop_paths:
                if os.path.exists(dp):
                    import time
                    filename = f"exported_video_{int(time.time())}.mp4"
                    target_path = os.path.join(dp, filename)
                    shutil.copy(output_path, target_path)
                    logger.info(f"SUCCESS: Video saved to Desktop at {target_path}")
                    break
            
            if not target_path:
                logger.warning("Could not find a valid Desktop folder to save to.")
                
        except Exception as e:
            logger.error(f"Warning: Could not save to Desktop automatically: {e}")
        # ---------------------------

        headers = {}
        if target_path:
            headers["X-Saved-Path"] = str(target_path)

        return FileResponse(
            output_path, 
            media_type="video/mp4", 
            filename="rendered_video.mp4",
            headers=headers
        )


    except Exception as e:
        logger.error(f"Render unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def create_ass_file(captions, style_config, offsets, overrides, output_path, video_info):
    """Generates an Advanced Substation Alpha (.ass) file for FFmpeg with Smart Styles."""
    
    width = video_info.get('width', 1080)
    height = video_info.get('height', 1920)
    
    # Use Arial as safe default if specified font is missing/complex
    # FFmpeg needs the font to be installed in Windows Fonts
    font_name = style_config.get('fontFamily', 'Arial').replace("'", "").split(',')[0].strip()
    if not font_name: font_name = 'Arial'
    
    font_size = 80 # Default fallback
    
    # ... (Keep font size logic or simplify) ... 
    
    primary_color = "&H00FFFFFF&" 
    
    ass_header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}

[v4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{font_size},{primary_color},&H000000FF&,&H00000000&,&H80000000&,-1,0,0,0,100,100,0,0,1,3,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(ass_header)
        
        # LOGGING ASS CONTENT FOR DEBUGGING
        logger.info(f"ASS Header generated. Preview:\n{ass_header}")
        
        dialogue_lines = []
        
        for i, cap in enumerate(captions):
            # ... (rest of loop)
            # We need to capture the lines to log them, but also write them.
            # Let's write directly but also keep a buffer for the first few to log.
            pass 

        # REWRITE LOOP TO ENABLE LOGGING AND WRITING
        for i, cap in enumerate(captions):
            # Handle both formats: single block text or word-level list
            words = cap.get('words', [])
            if not words and 'text' in cap:
                 words = [{'word': cap['text'], 'start': cap['start'], 'end': cap['end']}]

            start_time = format_ass_time(cap['start'])
            end_time = format_ass_time(cap['end'])
            
            offset = offsets.get(str(i), {'x': 0, 'y': 0})
            
            # Get style overrides for this specific caption block
            caption_override = overrides.get(str(i), {})
            
            # Calculate Position
            base_x = width // 2
            base_y = int(height * 0.75) # Default nice position
            pos_x = base_x + offset['x']
            pos_y = base_y + offset['y']
            
            line_ass = f"\\pos({pos_x},{pos_y})"
            
            full_line_text = ""
            
            for word_obj in words:
                word_text = word_obj['word']
                smart_style = word_obj.get('smartStyle', {}) or {}
                
                # Merge: Override > SmartStyle
                # We need to be careful not to overwrite smartStyle properties if override doesn't specify them
                # But actually, if override specifies color, it should apply to ALL words in that block usually?
                # Yes, Inspector applies to the block.
                
                final_style = smart_style.copy()
                final_style.update(caption_override)
                
                word_tags = ""
                
                if final_style:
                    if 'color' in final_style:
                        c = final_style['color'].replace('#', '')
                        if len(c) == 6:
                            ass_c = f"&H00{c[4:6]}{c[2:4]}{c[0:2]}&"
                            word_tags += f"\\c{ass_c}"
                            
                    if final_style.get('fontWeight') and (isinstance(final_style['fontWeight'], int) or str(final_style['fontWeight']).isdigit()) and int(final_style['fontWeight']) > 600:
                        word_tags += "\\b1"
                        
                    if final_style.get('fontStyle') == 'italic':
                        word_tags += "\\i1"
                        
                if 'fontFamily' in final_style:
                    font_str = final_style['fontFamily']
                    if "," in font_str:
                        font_name_override = font_str.split(',')[0].strip().replace("'", "").replace('"', "")
                    else:
                        font_name_override = font_str.strip().replace("'", "").replace('"', "")
                    
                    # Font Mapping for downloaded files
                    if "Caveat" in font_name_override:
                        font_name_override = "Caveat"
                    elif "Playfair" in font_name_override:
                        font_name_override = "Playfair Display"
                    elif "Montserrat" in font_name_override:
                        font_name_override = "Montserrat"
                        
                    word_tags += f"\\fn{font_name_override}"

                if 'fontSize' in final_style:
                    fs = final_style['fontSize']
                    if isinstance(fs, str) and 'em' in fs:
                        try:
                            scale = float(fs.replace('em', '')) * 100
                            word_tags += f"\\fscx{int(scale)}\\fscy{int(scale)}"
                        except: pass
                    elif isinstance(fs, (int, float)) or (isinstance(fs, str) and fs.isdigit()):
                        word_tags += f"\\fs{int(fs)}"

            if word_tags:
                full_line_text += f"{{{word_tags}}}{word_text}{{\\r}} " 
            else:
                full_line_text += f"{word_text} "

            line = f"Dialogue: 0,{start_time},{end_time},Default,,0,0,0,,{{{line_ass}}}{full_line_text.strip()}\n"
            f.write(line)
            if i < 5: dialogue_lines.append(line.strip())

        logger.info(f"First 5 ASS Lines:\n" + "\n".join(dialogue_lines))


def format_ass_time(seconds):
    """Formats seconds into ASS time format H:MM:SS.CC"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h}:{m:02d}:{s:05.2f}"


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
