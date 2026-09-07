import os
import cloudinary
import cloudinary.uploader
import cloudinary.utils
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


def upload_private_document(file: UploadFile, folder: str) -> dict:
    """Upload sensitive evidence as an authenticated asset, not a public URL."""
    cloudinary_folder = f"CampusAid/{folder}"
    result = cloudinary.uploader.upload(
        file.file,
        folder=cloudinary_folder,
        resource_type="auto",
        type="authenticated",
        use_filename=False,
        unique_filename=True,
    )
    return {
        "storage_key": result["public_id"],
        "storage_resource_type": result.get("resource_type", "raw"),
        "storage_format": result.get("format"),
        "storage_version": result.get("version"),
    }


def create_private_download_url_from_fields(
    storage_key: str,
    storage_format: str | None,
    storage_resource_type: str | None,
    expires_in_seconds: int = 300,
) -> tuple[str, int]:
    """Generate a short-lived URL for an authenticated Cloudinary asset."""
    import time

    expires_at = int(time.time()) + expires_in_seconds
    url = cloudinary.utils.private_download_url(
        storage_key,
        storage_format or "",
        resource_type=storage_resource_type or "raw",
        type="authenticated",
        expires_at=expires_at,
        attachment=False,
    )
    return url, expires_at


def create_private_download_url(document, expires_in_seconds: int = 300) -> tuple[str, int]:
    """Generate a short-lived URL for a verification document model."""
    return create_private_download_url_from_fields(
        document.storage_key,
        document.storage_format,
        document.storage_resource_type,
        expires_in_seconds,
    )
