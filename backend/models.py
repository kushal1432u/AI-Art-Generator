from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prompts = relationship("Prompt", back_populates="user")
    images = relationship("Image", back_populates="user")

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt_text = Column(Text, index=True)
    style = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="prompts")
    images = relationship("Image", back_populates="prompt")

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt_id = Column(Integer, ForeignKey("prompts.id"), nullable=True)
    image_url = Column(String) # For local it will be /static/images/filename.jpg
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="images")
    prompt = relationship("Prompt", back_populates="images")
