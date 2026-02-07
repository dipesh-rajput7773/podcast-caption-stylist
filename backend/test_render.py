import requests
import json
import os
import subprocess
import time

url = "http://localhost:8000/render"

# 1. Generate Valid MP4 (1 second black screen)
print("Generating valid test video...")
cmd = [
    "ffmpeg", "-y", "-f", "lavfi", "-i", "color=c=black:s=640x360:r=30", 
    "-t", "1", "-c:v", "libx264", "-pix_fmt", "yuv420p", "valid_test.mp4"
]
subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("valid_test.mp4 created.")

files = {
    'file': ('test_video.mp4', open('valid_test.mp4', 'rb'), 'video/mp4')
}

data = {
    'captions_json': json.dumps([
        {'text': 'Hello World', 'start': 0.1, 'end': 0.9, 'words': [{'word': 'Hello', 'start': 0.1, 'end': 0.5}, {'word': 'World', 'start': 0.5, 'end': 0.9}]}
    ]),
    'style_json': json.dumps({
        'name': 'Modern',
        'fontFamily': 'Arial',
        'fontSize': 24,
        'color': '#FFFFFF'
    }),
    'offsets_json': '{}',
    'overrides_json': '{}',
    'overlays_json': '[]',
    'fps': '30'
}

try:
    print("Sending request to /render...")
    start = time.time()
    response = requests.post(url, files=files, data=data)
    print(f"Time: {time.time() - start:.2f}s")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("SUCCESS! Video rendered.")
        print("Check your Desktop for 'exported_video_....mp4'")
    else:
        print(f"FAILED. Response: {response.text}")

except Exception as e:
    print(f"Error: {e}")
