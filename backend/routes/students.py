import os
import uuid
import shutil
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth
from ..utils import validate_upload_file, rate_limit_upload
from ..cloudinary_helper import upload_private_document, create_private_download_url


router = APIRouter(prefix="/students", tags=["Students"])

ALLOWED_DISABILITY_DOCUMENT_TYPES = {
    "student_id_card",
    "university_support_office",
    "medical_professional_report",
    "government_disability_certificate",
    "accessibility_assessment",
    "assistive_device_quote",
    "support_cost_quote",
    "approved_alternative",
}

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/profile", response_model=schemas.StudentOut)
def get_student_profile(current_user: models.User = Depends(auth.get_current_student), db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.user_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
    return student

@router.put("/profile", response_model=schemas.StudentOut)
def update_student_profile(profile_in: schemas.StudentUpdate, current_user: models.User = Depends(auth.get_current_student), db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.user_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")

    # Update Student table fields
    if profile_in.matric_number is not None:
        # Check if matric number is already taken
        existing = db.query(models.Student).filter(
            models.Student.matric_number == profile_in.matric_number,
            models.Student.student_id != student.student_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Matric number already registered by another student")
        student.matric_number = profile_in.matric_number
    if profile_in.department is not None:
        student.department = profile_in.department
    if profile_in.faculty is not None:
        student.faculty = profile_in.faculty
    if profile_in.level is not None:
        student.level = profile_in.level

    # Update User table fields
    user = current_user
    if profile_in.full_name is not None:
        user.full_name = profile_in.full_name
    if profile_in.phone_number is not None:
        user.phone_number = profile_in.phone_number

    db.commit()
    db.refresh(student)
    return student

@router.post("/requests", response_model=schemas.FundraisingRequestOut, status_code=status.HTTP_201_CREATED)
def create_fundraising_request(request_in: schemas.FundraisingRequestCreate, current_user: models.User = Depends(auth.get_current_student), db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.user_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student record not found")

    # Prevent overlapping open applications or campaigns.
    existing_pending = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.student_id == student.student_id,
        models.FundraisingRequest.application_status.in_(["submitted", "under_review", "changes_requested", "approved"]),
        models.FundraisingRequest.campaign_status.notin_(["closed", "cancelled"]),
    ).first()
    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active or pending fundraising request"
        )

    new_request = models.FundraisingRequest(
        student_id=student.student_id,
        title=request_in.title,
        description=request_in.description,
        amount_needed=request_in.amount_needed,
        amount_raised=0.0,
        purpose=request_in.purpose,
        status="pending",
        reason_for_request=request_in.reason_for_request,
        urgency_level=request_in.urgency_level,
        student_bank_name=request_in.student_bank_name,
        student_account_name=request_in.student_account_name,
        student_account_number=request_in.student_account_number,
        parent_or_guardian_occupation=request_in.parent_or_guardian_occupation,
        previous_support_received=request_in.previous_support_received,
        supporting_statement=request_in.supporting_statement,
        support_need_description=request_in.support_need_description,
        functional_impact=request_in.functional_impact,
        requested_support_type=request_in.requested_support_type,
        public_story=request_in.public_story,
        public_display_preference=request_in.public_display_preference,
        public_consent=request_in.public_consent,
        public_consent_at=datetime.datetime.utcnow() if request_in.public_consent else None,
        application_status="submitted",
        campaign_status="unpublished"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/requests", response_model=list[schemas.FundraisingRequestOut])
def get_student_requests(current_user: models.User = Depends(auth.get_current_student), db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.user_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student record not found")

    requests = db.query(models.FundraisingRequest).filter(models.FundraisingRequest.student_id == student.student_id).all()
    return requests

@router.get("/requests/{id}", response_model=schemas.FundraisingRequestOut)
def get_student_request_by_id(id: int, current_user: models.User = Depends(auth.get_current_student), db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.user_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student record not found")

    request = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.request_id == id,
        models.FundraisingRequest.student_id == student.student_id
    ).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fundraising request not found or not owned by you")
    return request

@router.post("/requests/{id}/documents", response_model=schemas.VerificationDocumentOut, dependencies=[Depends(rate_limit_upload)])
def upload_request_document(
    id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_student),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.user_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student record not found")

    request = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.request_id == id,
        models.FundraisingRequest.student_id == student.student_id
    ).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fundraising request not found or not owned by you")

    if request.application_status not in ["submitted", "changes_requested"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload documents for requests that are already reviewed"
        )

    if document_type not in ALLOWED_DISABILITY_DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported disability evidence type")

    # Validate file format and size
    validate_upload_file(file)

    # Store disability evidence as an authenticated asset, without a public URL.
    private_asset = upload_private_document(file, folder="verification_documents")

    new_doc = models.VerificationDocument(
        request_id=request.request_id,
        document_type=document_type,
        **private_asset
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Add notification for admin
    # (Since there are multiple admins, we can skip specific admin target, or add a log later.
    #  We will add a notification for the student indicating successful upload.)
    student_notification = models.Notification(
        user_id=current_user.user_id,
        title="Document Uploaded",
        message=f"Your document '{document_type}' has been successfully uploaded to request '{request.title}'."
    )
    db.add(student_notification)
    db.commit()

    return new_doc


@router.get("/documents/{document_id}/access", response_model=schemas.PrivateDocumentAccessOut)
def access_own_document(
    document_id: int,
    current_user: models.User = Depends(auth.get_current_student),
    db: Session = Depends(get_db),
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    document = db.query(models.VerificationDocument).join(models.FundraisingRequest).filter(
        models.VerificationDocument.document_id == document_id,
        models.FundraisingRequest.student_id == student.student_id,
    ).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if not document.storage_key:
        return {"url": document.file_path, "expires_at": datetime.datetime.now(datetime.timezone.utc)}
    url, expires_at = create_private_download_url(document)
    return {"url": url, "expires_at": datetime.datetime.fromtimestamp(expires_at, datetime.timezone.utc)}
