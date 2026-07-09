import os
import time
from fastapi import UploadFile, HTTPException, Request, status

# In-memory store for rate limiting (scope:IP -> list of timestamps)
auth_rate_limits = {}

def _rate_limit(request: Request, scope: str, max_attempts: int, window_seconds: int):
    ip = request.client.host if request.client else "unknown"
    key = f"{scope}:{ip}"
    now = time.time()
    attempts = [t for t in auth_rate_limits.get(key, []) if now - t < window_seconds]
    if len(attempts) >= max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Please try again in {window_seconds} seconds."
        )
    attempts.append(now)
    auth_rate_limits[key] = attempts

def rate_limit_auth(request: Request):
    _rate_limit(request, "auth", max_attempts=10, window_seconds=60)

def rate_limit_login(request: Request):
    _rate_limit(request, "login", max_attempts=5, window_seconds=60)

def rate_limit_invite(request: Request):
    _rate_limit(request, "invite", max_attempts=20, window_seconds=60)

def rate_limit_upload(request: Request):
    _rate_limit(request, "upload", max_attempts=20, window_seconds=60)

def validate_upload_file(file: UploadFile):
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    
    # 1. Extension validation
    allowed_extensions = {".png", ".jpg", ".jpeg", ".pdf", ".doc", ".docx"}
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File extension {ext} not allowed. Supported formats: PNG, JPG, JPEG, PDF, DOC, DOCX."
        )

    # 2. Content-Type/MIME type validation
    allowed_content_types = {
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail=f"MIME type '{file.content_type}' is not allowed."
        )

    # 3. File size validation (Max 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    content = file.file.read(MAX_FILE_SIZE + 1)
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the 5MB limit."
        )
    file.file.seek(0)
