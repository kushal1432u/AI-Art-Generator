from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Prompt Schemas
class PromptBase(BaseModel):
    prompt_text: str
    style: str = "Realistic"

class PromptCreate(PromptBase):
    pass

class Prompt(PromptBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Image Schemas
class ImageBase(BaseModel):
    image_url: str

class ImageCreate(ImageBase):
    prompt_id: Optional[int] = None

class Image(ImageBase):
    id: int
    user_id: int
    prompt_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
        
# Generate Logic
class GenerateRequest(BaseModel):
    prompt: str
    style: str = "Realistic"
    aspect_ratio: str = "1:1"
    width: int = 1024
    height: int = 1024
    num_images: int = 1
