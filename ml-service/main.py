from fastapi import FastAPI,UploadFile, File, Form,HTTPException
from prereq_gap_mapper_V3 import run
import requests

# from lecture_memory_rebuilder import router as lecture_router
# ... imports are above ...

# --- ADD THIS CONFIGURATION ---
# Update this URL every time you restart Google Colab
COLAB_AI_URL = "https://epizoutically-tyronic-kaysen.ngrok-free.dev"

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
def analyze_endpoint(data: dict):
    return run(data)# --- ADD THIS NEW ROUTE ---

@app.post("/revision-tool")
async def create_revision_content(
    topic: str = Form(...),
    weakness: str = Form(...),
    file: UploadFile = File(...)
):
    """
    1. Receives image + data from your Frontend.
    2. Sends it to the Google Colab AI Engine.
    3. Returns the AI's flashcards & quiz.
    """
    
    # 1. Prepare the data for Colab
    # We read the file bytes to send them over the internet
    file_bytes = await file.read()
    
    payload = {
        "topic": topic,
        "weakness": weakness
    }
    
    # "files" structure for the requests library
    files_data = {
        'file': (file.filename, file_bytes, file.content_type)
    }

    # 2. Send to Colab (The "Remote Brain")
    try:
        # We target the "/generate" endpoint we built in Colab
        colab_endpoint = f"{COLAB_AI_URL}/generate"
        
        print(f"📡 Forwarding request to AI at: {colab_endpoint}")
        
        # Increased timeout to 300s (5 mins) for very large models/slow Colab
        response = requests.post(colab_endpoint, data=payload, files=files_data, timeout=300)

        print(f"✅ AI Response Status: {response.status_code}")

        # 3. Check response
        if response.status_code == 200:
            return response.json() # Success! Return AI data to frontend
        else:
            # If Colab errors out (e.g. GPU out of memory), tell the frontend
            print(f"❌ Colab Error: {response.text}")
            raise HTTPException(status_code=500, detail=f"Colab Error: {response.text}")

    except requests.exceptions.Timeout:
        print("❌ Request timed out waiting for Colab.")
        raise HTTPException(status_code=504, detail="AI is taking too long to respond. The model might be slow or Colab is busy.")
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Check COLAB_AI_URL.")
        raise HTTPException(status_code=503, detail="Could not connect to AI. Is the Colab URL correct and running?")

@app.post("/prioritize")
async def prioritize_content(
    syllabus: str = Form(...),
    exam_name: str = Form(...)
):
    """
    1. Receives syllabus + exam details.
    2. Sends it to the Google Colab AI Engine.
    3. Returns the prioritized list and strategy.
    """
    
    payload = {
        "syllabus": syllabus,
        "exam_name": exam_name
    }
    
    try:
        colab_endpoint = f"{COLAB_AI_URL}/prioritize"
        print(f"📡 Forwarding request to AI at: {colab_endpoint}")
        
        response = requests.post(colab_endpoint, json=payload)

        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=500, detail=f"Colab Error: {response.text}")

    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Could not connect to AI. Is the Colab URL correct and running?")
# app.include_router(lecture_router)
