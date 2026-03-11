from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import models
from database import engine
from routers import auth, generate, gallery, user

# Create tables if not using Alembic migrations
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Art Generator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directory exists for local image storage
os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(generate.router)
app.include_router(gallery.router)
app.include_router(user.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Art Generator API"}
