import os
import uuid
import shutil
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth
from ..utils import validate_upload_file, rate_limit_upload
from ..cloudinary_helper import upload_private_document, create_private_download_url_from_fields


router = APIRouter(prefix="/donors", tags=["Donors"])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/donations", response_model=schemas.DonationRecordOut, status_code=status.HTTP_201_CREATED)
def create_donation(donation_in: schemas.DonationRecordCreate, current_user: models.User = Depends(auth.get_current_donor), db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.user_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor record not found")

    # Donations are accepted only while the public campaign is active.
    campaign = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.request_id == donation_in.request_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    if campaign.application_status != "approved" or campaign.campaign_status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Campaign is not currently active for donations"
        )
    remaining = campaign.amount_needed - campaign.amount_raised
    if donation_in.amount > remaining:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Donation exceeds the remaining campaign target of ₦{remaining:,.2f}"
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

    asset = upload_private_document(file, folder="donation_proofs")
    donation.proof_storage_key = asset["storage_key"]
    donation.proof_storage_resource_type = asset["storage_resource_type"]
    donation.proof_storage_format = asset["storage_format"]
    donation.proof_storage_version = asset["storage_version"]
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


@router.get("/donations/{id}/proof/access", response_model=schemas.PrivateDocumentAccessOut)
def access_own_donation_proof(
    id: int,
    current_user: models.User = Depends(auth.get_current_donor),
    db: Session = Depends(get_db),
):
    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.user_id).first()
    donation = db.query(models.DonationRecord).filter(
        models.DonationRecord.donation_id == id,
        models.DonationRecord.donor_id == donor.donor_id,
    ).first() if donor else None
    if not donation:
        raise HTTPException(status_code=404, detail="Donation record not found")

    if donation.proof_storage_key:
        url, expires_at = create_private_download_url_from_fields(
            donation.proof_storage_key,
            donation.proof_storage_format,
            donation.proof_storage_resource_type,
        )
    elif donation.proof_file:
        url, expires_at = donation.proof_file, int(datetime.datetime.now(datetime.timezone.utc).timestamp()) + 300
    else:
        raise HTTPException(status_code=404, detail="Donation proof not found")
    return {"url": url, "expires_at": datetime.datetime.fromtimestamp(expires_at, tz=datetime.timezone.utc)}

@router.get("/donations", response_model=list[schemas.DonationRecordOut])
def get_donor_donations(current_user: models.User = Depends(auth.get_current_donor), db: Session = Depends(get_db)):
    donor = db.query(models.Donor).filter(models.Donor.user_id == current_user.user_id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor record not found")

    donations = db.query(models.DonationRecord).filter(
        models.DonationRecord.donor_id == donor.donor_id
    ).order_by(models.DonationRecord.donation_date.desc()).all()
    return donations
