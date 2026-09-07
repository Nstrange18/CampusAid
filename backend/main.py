import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import get_db
from . import models, schemas, auth
from .routes import auth as auth_router, students as students_router, donors as donors_router, campaigns as campaigns_router, admin as admin_router

app = FastAPI(
    title="CampusAid API",
    description="Backend API for disability-related support campaigns for students with physical disabilities",
    version="1.0.0"
)

# CORS Configuration
environment = os.getenv("ENVIRONMENT", "development").lower()
frontend_url = os.getenv("FRONTEND_URL")
if environment == "production" and not frontend_url:
    raise RuntimeError("FRONTEND_URL is required in production")

origins = []
if environment != "production":
    origins.extend([
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ])
if frontend_url:
    origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$" if environment != "production" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads folder exists and is mounted
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
if environment != "production":
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router.router)
app.include_router(students_router.router)
app.include_router(donors_router.router)
app.include_router(campaigns_router.router)
app.include_router(admin_router.router)

# General notification endpoints
@app.get("/notifications", response_model=list[schemas.NotificationOut], tags=["Notifications"])
def get_user_notifications(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.user_id
    ).order_by(models.Notification.created_at.desc()).all()
    return notifications

@app.put("/notifications/{id}/read", response_model=schemas.NotificationOut, tags=["Notifications"])
def mark_notification_as_read(id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    notification = db.query(models.Notification).filter(
        models.Notification.notification_id == id,
        models.Notification.user_id == current_user.user_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CampusAid API Server",
        "documentation": "/docs"
    }
