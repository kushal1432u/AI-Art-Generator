import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx
import uuid
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load .env from backend directory
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(env_path)

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/generate",
    tags=["Image Generation"]
)

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# more stable HF model endpoint; avoid FLUX.1-dev
# the legacy api-inference endpoint is deprecated – use router.huggingface.co now
HF_MODEL_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"

DAILY_IMAGE_LIMIT = 10

@router.get("/limit")
def get_daily_limit(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    count = db.query(models.Image).filter(
        models.Image.user_id == current_user.id,
        models.Image.created_at >= today_start
    ).count()
    
    remaining = max(0, DAILY_IMAGE_LIMIT - count)
    return {
        "limit": DAILY_IMAGE_LIMIT,
        "used": count,
        "remaining": remaining
    }

async def query_huggingface(prompt_text: str, width: int = 1024, height: int = 1024) -> bytes:
    """Generate an image via the new HuggingFace router endpoint (router.huggingface.co).

    The legacy api-inference.huggingface.co endpoint is gone (410). We now POST
    directly to router.huggingface.co using httpx so we have full control over
    the URL and headers.
    """
    if not HUGGINGFACE_API_KEY:
        raise HTTPException(status_code=500, detail="Missing HF API key")

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json",
        "x-wait-for-model": "true",
    }
    
    payload = {
        "inputs": prompt_text,
        "parameters": {
            "width": width,
            "height": height
        }
    }

    print(f"Calling HF router: {HF_MODEL_URL}")
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(HF_MODEL_URL, headers=headers, json=payload)
    except Exception as e:
        print(f"HF request error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    if response.status_code != 200:
        detail = f"HuggingFace API error {response.status_code}: {response.text[:300]}"
        print(detail)
        raise HTTPException(status_code=500, detail=detail)

    return response.content

@router.post("", response_model=schemas.Image)
async def generate_image(request: schemas.GenerateRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    
    # Check daily limit before proceeding
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    count = db.query(models.Image).filter(
        models.Image.user_id == current_user.id,
        models.Image.created_at >= today_start
    ).count()
    
    if count >= DAILY_IMAGE_LIMIT:
        raise HTTPException(status_code=429, detail=f"Daily limit of {DAILY_IMAGE_LIMIT} images reached. Please try again tomorrow.")
        
    # Simple prompt enhancement mapping
    style_enhancements = {
        "Realistic": "highly detailed, 8k resolution, photorealistic, raw, masterpiece",
        "Anime": "anime style, studio ghibli, makoto shinkai, highly detailed, vibrant colors",
        "Cartoon": "cartoon style, 2d animation, flat colors, vectorized",
        "Fantasy": "epic fantasy, majestic, magical, cinematic lighting, greg rutkowski",
        "Cyberpunk": "cyberpunk futuristic, highly detailed, neon lighting,, sci-fi",
        "Abstract": "abstract art, non-representational, fluid, vibrant, emotional"
    }

    enhancement = style_enhancements.get(request.style, "")
    enhanced_prompt = f"{request.prompt}, {enhancement}"
    
    # Calculate Width and Height based on aspect ratio
    # Base maximum dimension is 1024
    max_dim = 1024
    width = 1024
    height = 1024
    
    if request.aspect_ratio:
        if request.aspect_ratio == "1:1":
            width, height = 1024, 1024
        elif request.aspect_ratio == "2:3":
            width, height = 682, 1024
        elif request.aspect_ratio == "3:2":
            width, height = 1024, 682
        elif request.aspect_ratio == "4:5":
            width, height = 819, 1024
        elif request.aspect_ratio == "5:4":
            width, height = 1024, 819
        elif request.aspect_ratio == "9:16" or request.aspect_ratio == "TikTok":
            width, height = 576, 1024
        elif request.aspect_ratio == "16:9":
            width, height = 1024, 576
    
    # 1. Save Prompt in DB
    new_prompt = models.Prompt(
        user_id=current_user.id,
        prompt_text=request.prompt,
        style=request.style
    )
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)
    
    # 2. Call AI Image Generation API (try Hugging Face first, fall back to placeholder)
    image_bytes = None

    if HUGGINGFACE_API_KEY:
        # If the Hugging Face call fails we let the exception bubble up so
        # the client sees the proper error message instead of getting a
        # meaningless placeholder image.
        image_bytes = await query_huggingface(enhanced_prompt, width, height)
    else:
        raise HTTPException(status_code=500, detail="HuggingFace API Key is missing. Cannot generate real images.")

    if not image_bytes or len(image_bytes) < 1000:
        raise HTTPException(status_code=500, detail="Failed to generate image from HuggingFace.")

    # 3. Save Image Locally
    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join("static", "images", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    with open(filepath, "wb") as f:
        f.write(image_bytes)
        
    image_url = f"/static/images/{filename}"
    
    # 4. Save Image record in DB
    new_image = models.Image(
        user_id=current_user.id,
        prompt_id=new_prompt.id,
        image_url=image_url
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    
    return new_image
