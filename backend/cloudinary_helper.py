import os
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_to_cloudinary(file: UploadFile, folder: str = "campusaid") -> str:
    cloudinary_folder = f"CampusAid/{folder}" if folder else "CampusAid"
    result = cloudinary.uploader.upload(
        file.file,
        folder=cloudinary_folder,
        resource_type="auto"
    )
    return result.get("secure_url")
