import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth
from ..utils import validate_upload_file, rate_limit_upload
from ..cloudinary_helper import upload_to_cloudinary


router = APIRouter(prefix="/donors", tags=["Donors"])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/donations", response_model=schemas.DonationRecordOut, status_code=status.HTTP_201_CREATED)
def create_donation(donation_in: schemas.DonationRecordCreate, current_user: models.User = Depends(auth.get_current_donor), db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.user_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor record not found")

    # Check if request exists and is active (approved)
    campaign = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.request_id == donation_in.request_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    if campaign.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Campaign is not currently active for donations"
        )

    # Check for duplicate transaction reference
    existing_ref = db.query(models.DonationRecord).filter(
        models.DonationRecord.transaction_reference == donation_in.transaction_reference
    ).first()
    if existing_ref:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A donation with this transaction reference already exists"
        )

    new_donation = models.DonationRecord(
        donor_id=donor.donor_id,
        request_id=donation_in.request_id,
        amount=donation_in.amount,
        transaction_reference=donation_in.transaction_reference,
        verification_status="pending"
    )
    db.add(new_donation)
    db.commit()
    db.refresh(new_donation)
    return new_donation

@router.post("/donations/{id}/proof", response_model=schemas.DonationRecordOut, dependencies=[Depends(rate_limit_upload)])
def upload_donation_proof(
    id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_donor),
    db: Session = Depends(get_db)
):
    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.user_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor record not found")

    donation = db.query(models.DonationRecord).filter(
        models.DonationRecord.donation_id == id,
        models.DonationRecord.donor_id == donor.donor_id
    ).first()
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation record not found or not owned by you")

    if donation.verification_status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload proof for an already reviewed donation"
        )

    # Validate file format and size
    validate_upload_file(file)

    # Upload to Cloudinary
    proof_url = upload_to_cloudinary(file, folder="donation_proofs")
    donation.proof_file = proof_url
    db.commit()
    db.refresh(donation)

    # Notify donor
    donor_notification = models.Notification(
        user_id=current_user.user_id,
        title="Donation Proof Uploaded",
        message=f"Your proof of payment for transaction reference '{donation.transaction_reference}' has been uploaded and is pending administrator verification."
    )
    db.add(donor_notification)
    db.commit()

    return donation

@router.get("/donations", response_model=list[schemas.DonationRecordOut])
def get_donor_donations(current_user: models.User = Depends(auth.get_current_donor), db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.user_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor record not found")

    donations = db.query(models.DonationRecord).filter(
        models.DonationRecord.donor_id == donor.donor_id
    ).order_by(models.DonationRecord.donation_date.desc()).all()
    return donations
