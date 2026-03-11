import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/user",
    tags=["User Dashboard"]
)

@router.get("/me", response_model=schemas.User)
def get_user_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/images", response_model=List[schemas.Image])
def get_user_images(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    images = db.query(models.Image).filter(models.Image.user_id == current_user.id).order_by(models.Image.created_at.desc()).all()
    return images

@router.get("/prompts", response_model=List[schemas.Prompt])
def get_user_prompts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    prompts = db.query(models.Prompt).filter(models.Prompt.user_id == current_user.id).order_by(models.Prompt.created_at.desc()).all()
    return prompts

@router.get("/stats")
def get_user_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total_images = db.query(models.Image).filter(models.Image.user_id == current_user.id).count()
    total_prompts = db.query(models.Prompt).filter(models.Prompt.user_id == current_user.id).count()
    return {
        "total_images": total_images,
        "total_prompts": total_prompts
    }
