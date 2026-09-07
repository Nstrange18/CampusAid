from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


def beneficiary_display_name(request: models.FundraisingRequest) -> str:
    """Return only the identity representation the student consented to publish."""
    full_name = request.student.user.full_name if request.student and request.student.user else "Student"
    if request.public_display_preference == "full_name":
        return full_name
    if request.public_display_preference == "anonymous":
        return "Anonymous student"
    parts = full_name.split()
    return f"{parts[0]} {parts[-1][0]}." if len(parts) > 1 else parts[0]


def public_campaign(request: models.FundraisingRequest) -> dict:
    return {
        "request_id": request.request_id,
        "title": request.title,
        "description": request.public_story,
        "amount_needed": request.amount_needed,
        "amount_raised": request.amount_raised,
        "purpose": request.purpose,
        "status": request.campaign_status,
        "urgency_level": request.urgency_level,
        "requested_support_type": request.requested_support_type,
        "beneficiary_display_name": beneficiary_display_name(request),
        "date_submitted": request.date_submitted,
    }

@router.get("", response_model=list[schemas.CampaignPublicOut])
def get_approved_campaigns(db: Session = Depends(get_db)):
    # Donors/Public can only see approved and active campaigns
    campaigns = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.application_status == "approved",
        models.FundraisingRequest.campaign_status.in_(["active", "funded"]),
        models.FundraisingRequest.public_consent.is_(True)
    ).all()
    return [public_campaign(campaign) for campaign in campaigns]

@router.get("/{id}")
def get_campaign_by_id(id: int, db: Session = Depends(get_db)):
    # Retrieve the fundraising request
    request = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.request_id == id
    ).first()
    
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
        
    if (
        request.application_status != "approved"
        or request.campaign_status not in ["active", "funded", "closed"]
        or not request.public_consent
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Campaign is not currently active"
        )
        
    # Get admin payment accounts (active only)
    admin_accounts = db.query(models.DonationAccount).filter(models.DonationAccount.status == "active").all()
    
    return {
        "campaign": {
            "request_id": request.request_id,
            "title": request.title,
            "description": request.public_story,
            "amount_needed": request.amount_needed,
            "amount_raised": request.amount_raised,
            "purpose": request.purpose,
            "urgency_level": request.urgency_level,
            "status": request.campaign_status,
            "student_bank_name": None,
            "student_account_name": None,
            "student_account_number": None,
            "requested_support_type": request.requested_support_type,
            "date_submitted": request.date_submitted
        },
        "student": {
            "full_name": beneficiary_display_name(request),
            "department": "Withheld for privacy",
            "faculty": "Withheld for privacy",
            "level": "Withheld for privacy"
        },
        "admin_payment_accounts": [
            {
                "bank_name": acc.bank_name,
                "account_name": acc.account_name,
                "account_number": acc.account_number,
                "payment_instruction": acc.payment_instruction
            }
            for acc in admin_accounts
        ]
    }
