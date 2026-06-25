import os
import time
from fastapi import UploadFile, HTTPException, Request, status

# In-memory store for rate limiting (IP -> list of timestamps)
auth_rate_limits = {}

def rate_limit_auth(request: Request):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    # 10 attempts max per 60 seconds
    attempts = [t for t in auth_rate_limits.get(ip, []) if now - t < 60]
    if len(attempts) >= 10:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication requests. Please try again in 60 seconds."
        )
    attempts.append(now)
    auth_rate_limits[ip] = attempts

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
