from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib, requests, random, time, os, re
import numpy as np
from collections import defaultdict
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

IMGFLIP_USERNAME = os.getenv("IMGFLIP_USERNAME")
IMGFLIP_PASSWORD = os.getenv("IMGFLIP_PASSWORD")
GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY")

if not IMGFLIP_USERNAME or not IMGFLIP_PASSWORD:
    raise ValueError("IMGFLIP credentials not found in environment variables!")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables!")

client = genai.Client(api_key=GEMINI_API_KEY)

tfidf = joblib.load("artifacts/tfidf_baseline.joblib")
clf   = joblib.load("artifacts/logreg_baseline.joblib")

app = FastAPI(title="Memefy-AI Backend")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

class MemeRequest(BaseModel):
    idea: str | None = None
    caption: str | None = None
    texts: list[str] | None = None
    template_id: str | None = None

def check_safety(text, threshold=0.5):
    vec = tfidf.transform([text])
    prob = clf.predict_proba(vec)[0][1]
    return prob < threshold, float(prob)


def calibrate_toxicity(text, prob):
    lowered = (text or "").lower()

    toxic_markers = [
        "kill", "die", "stupid", "idiot", "hate", "abuse", "racist", "nazi"
    ]
    if any(marker in lowered for marker in toxic_markers):
        return float(prob)

    benign_markers = [
        "naruto", "one piece", "anime", "manga", "movie", "music", "football", "cricket"
    ]
    if any(marker in lowered for marker in benign_markers):
        return float(min(prob, 0.12))

    if len(lowered.split()) <= 8 and "?" in lowered:
        return float(min(prob, 0.2))

    return float(prob)

def sentiment_label(prob):
    if prob < 0.15:
        return "Positive / Safe"
    elif prob < 0.35:
        return "Neutral / Sarcastic"
    else:
        return "Risky / Negative"

def gemini_prompt(idea, box_count=1):
    box_guidelines = ""
    if box_count == 2:
        box_guidelines = "You MUST format your response exactly as 'BOX1: [setup] | BOX2: [punchline]'. Do not provide any other text."
    elif box_count > 2:
        box_guidelines = f"You MUST split the idea into {box_count} parts using 'BOX1:', 'BOX2:', etc. separated by '|'. No other text."
    else:
        box_guidelines = "Keep it a single short, punchy sentence."

    return f"""
You are a master meme creator. Generate a meme caption for the given idea. 

Style: Hinglish + modern internet slang (e.g., 'vibe is real', 'no cap', 'literally me', 'POV').
Text Structure: {box_guidelines}

Rules:
- High humor factor.
- Relatable to Gen-Z/Millennials.
- If multiple boxes are requested, ensure the split makes sense for the template.
- NO generic intros like "Caption:".
- Output only the text for the boxes.

Idea: {idea}
"""

def generate_gemini_caption(idea, box_count=1):
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=gemini_prompt(idea, box_count),
            config=types.GenerateContentConfig(
                temperature=0.9,
                max_output_tokens=60
            )
        )
        return response.text.strip() if response.text else f"{idea}"
    except Exception:
        return f"{idea}"

def normalize_caption(text):
    # Remove common AI prefixes
    text = re.sub(r'^(Caption|Meme|Text|Output):\s*', '', text, flags=re.IGNORECASE)
    return text.replace('"', "").replace("'", "").strip()

def generate_safe_caption(idea, box_count=1, attempts=3):
    for _ in range(attempts):
        raw = generate_gemini_caption(idea, box_count)
        caption = normalize_caption(raw)
        safe, prob = check_safety(caption)
        prob = calibrate_toxicity(caption, prob)
        if prob < 0.5:
            return caption, prob
    return idea, 0.1

def fit_caption_to_boxes(generated_text, box_count):
    # Standard format: BOX1: ... | BOX2: ...
    if "|" in generated_text and "BOX1" in generated_text:
        parts = []
        for i in range(1, box_count + 1):
            pattern = f"BOX{i}:\\s*(.*?)(?=\\s*\\|\\s*BOX{i+1}|\\s*$)"
            match = re.search(pattern, generated_text, re.IGNORECASE | re.DOTALL)
            if match:
                parts.append(match.group(1).strip())
            else:
                parts.append("")
        return parts
    
    # Fallback 1: Text contains vs (common for 2 boxes)
    if box_count == 2 and " vs " in generated_text.lower():
        p = re.split(r"\s+vs\s+", generated_text, flags=re.IGNORECASE)
        return [p[0], p[1]] if len(p) == 2 else [generated_text, ""]

    # Fallback 2: General split
    if box_count == 1:
        return [generated_text]
    
    # Fallback 3: If no markers found for multi-box, put all in BOX1 (usually the theme)
    # instead of BOX2 (usually the reaction). This fixes the "empty card" issue.
    clean_text = re.sub(r'BOX\d+:\s*', '', generated_text, flags=re.IGNORECASE).strip()
    res = [""] * box_count
    res[0] = clean_text
    return res

def create_meme(template_id, captions):
    payload = {
        "template_id": template_id,
        "username": IMGFLIP_USERNAME,
        "password": IMGFLIP_PASSWORD
    }
    for i, text in enumerate(captions):
        payload[f"boxes[{i}][text]"] = text
    
    resp = requests.post("https://api.imgflip.com/caption_image", data=payload).json()
    return resp

def fetch_templates_data():
    try:
        r = requests.get("https://api.imgflip.com/get_memes")
        data = r.json()
        return data["data"]["memes"] if data["success"] else []
    except Exception:
        return []

template_usage = defaultdict(list)

def update_template_trend(template_id):
    template_usage[template_id].append(time.time())

def is_template_trending(template_id, window=3600, threshold=5):
    now = time.time()
    recent = [t for t in template_usage[template_id] if now - t < window]
    return len(recent) >= threshold, len(recent)

@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Memefy-AI Production Ready API"}

@app.get("/templates")
def get_templates():
    return {"success": True, "templates": fetch_templates_data()}

@app.post("/generate-meme")
def generate_meme_endpoint(req: MemeRequest):
    templates = fetch_templates_data()
    idea = req.idea or "random meme"
    
    # 1. Select Template
    if req.template_id:
        template = next((t for t in templates if str(t["id"]) == str(req.template_id)), None)
        if not template:
            template = random.choice(templates[:50])
    else:
        template = random.choice(templates[:50]) # Pick from top 50 popular

    box_count = template.get("box_count", 2)

    # 2. Get Caption & Toxicity
    if req.texts and len(req.texts) > 0:
        # Use provided texts (Manual flow)
        caption_lines = req.texts
        caption_text = " ".join(caption_lines)
        _, toxicity = check_safety(caption_text)
        toxicity = calibrate_toxicity(caption_text, toxicity)
    elif req.caption:
        # Use provided single caption (AI flow with user tweak)
        caption_text = normalize_caption(req.caption)
        _, toxicity = check_safety(caption_text)
        toxicity = calibrate_toxicity(caption_text, toxicity)
        caption_lines = fit_caption_to_boxes(caption_text, box_count)
    else:
        # Generate new caption (Full AI flow)
        caption_text, toxicity = generate_safe_caption(idea, box_count)
        caption_lines = fit_caption_to_boxes(caption_text, box_count)

    sentiment = sentiment_label(toxicity)
    
    # 3. Generate Image
    update_template_trend(template["id"])
    trending, usage = is_template_trending(template["id"])
    
    img_resp = create_meme(template["id"], caption_lines)

    if not img_resp.get("success"):
        return {"success": False, "error": img_resp.get("error_message", "Imgflip Error")}

    return {
        "success": True,
        "caption": caption_text,
        "sentiment": sentiment,
        "toxicity_score": round(toxicity, 3),
        "template": template["name"],
        "template_trending": trending,
        "template_recent_usage": usage,
        "meme_url": img_resp["data"]["url"]
    }