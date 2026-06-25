from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("", response_model=list[schemas.CampaignPublicOut])
def get_approved_campaigns(db: Session = Depends(get_db)):
    # Donors/Public can only see approved and active campaigns
    campaigns = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.status == "approved"
    ).all()
    return campaigns

@router.get("/{id}")
def get_campaign_by_id(id: int, db: Session = Depends(get_db)):
    # Retrieve the fundraising request
    request = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.request_id == id
    ).first()
    
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
        
    if request.status != "approved" and request.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Campaign is not currently active"
        )
        
    # Get student profile (basic info only)
    student = db.query(models.Student).filter(models.Student.student_id == request.student_id).first()
    student_user = db.query(models.User).filter(models.User.user_id == student.user_id).first() if student else None
    
    # Get admin payment accounts (active only)
    admin_accounts = db.query(models.DonationAccount).filter(models.DonationAccount.status == "active").all()
    
    return {
        "campaign": {
            "request_id": request.request_id,
            "title": request.title,
            "description": request.description,
            "amount_needed": request.amount_needed,
            "amount_raised": request.amount_raised,
            "purpose": request.purpose,
            "urgency_level": request.urgency_level,
            "status": request.status,
            "student_bank_name": None,
            "student_account_name": None,
            "student_account_number": None,
            "parent_or_guardian_occupation": request.parent_or_guardian_occupation,
            "previous_support_received": request.previous_support_received,
            "supporting_statement": request.supporting_statement,
            "date_submitted": request.date_submitted
        },
        "student": {
            "full_name": student_user.full_name if student_user else "N/A",
            "department": student.department if student else "N/A",
            "faculty": student.faculty if student else "N/A",
            "level": student.level if student else "N/A"
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
