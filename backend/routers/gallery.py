import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/gallery",
    tags=["Gallery"]
)

@router.get("")
def get_gallery_images(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    # Fetch latest images and join with Prompts to get the text
    results = (
        db.query(models.Image, models.Prompt)
        .join(models.Prompt, models.Image.prompt_id == models.Prompt.id)
        .order_by(models.Image.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Format the response for the frontend
    gallery = []
    for image, prompt in results:
        gallery.append({
            "id": image.id,
            "image_url": image.image_url,
            "prompt": prompt.prompt_text,
            "created_at": image.created_at,
            "user_id": image.user_id,
        })
        
    return gallery

@router.delete("/{image_id}")
def delete_gallery_image(image_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    image = db.query(models.Image).filter(models.Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    if not current_user.is_admin and image.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized. You can only delete your own images.")
        
    # Delete from filesystem
    if image.image_url.startswith("/static/images/"):
        file_path = "." + image.image_url
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing file {file_path}: {str(e)}")
                
    # Delete from database
    db.delete(image)
    db.commit()
    
    return {"message": "Image deleted successfully"}
