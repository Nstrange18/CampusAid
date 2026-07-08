import os
import uuid
import shutil
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth
from ..utils import validate_upload_file
from ..cloudinary_helper import upload_to_cloudinary


router = APIRouter(prefix="/admin", tags=["Admin"])

# Helper to get admin profile from current user
def get_admin_record(current_user: models.User, db: Session) -> models.Administrator:
    admin = db.query(models.Administrator).filter(models.Administrator.user_id == current_user.user_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrator record not found"
        )
    return admin

@router.get("/dashboard")
def get_admin_dashboard(current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    get_admin_record(current_user, db)

    total_requests = db.query(models.FundraisingRequest).count()
    pending_requests = db.query(models.FundraisingRequest).filter(models.FundraisingRequest.status == "pending").count()
    approved_requests = db.query(models.FundraisingRequest).filter(models.FundraisingRequest.status == "approved").count()
    completed_requests = db.query(models.FundraisingRequest).filter(models.FundraisingRequest.status == "completed").count()

    total_donations_value = db.query(models.DonationRecord).filter(models.DonationRecord.verification_status == "verified")
    total_donations_sum = sum([d.amount for d in total_donations_value])

    pending_donations = db.query(models.DonationRecord).filter(models.DonationRecord.verification_status == "pending").count()
    total_users = db.query(models.User).count()
    total_students = db.query(models.Student).count()
    total_donors = db.query(models.Donor).count()

    # Recent activities (last 5 requests & last 5 donations)
    recent_requests = db.query(models.FundraisingRequest).order_by(models.FundraisingRequest.date_submitted.desc()).limit(5).all()
    recent_donations = db.query(models.DonationRecord).order_by(models.DonationRecord.donation_date.desc()).limit(5).all()

    return {
        "stats": {
            "total_requests": total_requests,
            "pending_requests": pending_requests,
            "approved_requests": approved_requests,
            "completed_requests": completed_requests,
            "total_donations_sum": total_donations_sum,
            "pending_donations": pending_donations,
            "total_users": total_users,
            "total_students": total_students,
            "total_donors": total_donors
        },
        "recent_requests": [
            {
                "request_id": r.request_id,
                "title": r.title,
                "amount_needed": r.amount_needed,
                "status": r.status,
                "date_submitted": r.date_submitted
            } for r in recent_requests
        ],
        "recent_donations": [
            {
                "donation_id": d.donation_id,
                "amount": d.amount,
                "transaction_reference": d.transaction_reference,
                "verification_status": d.verification_status,
                "donation_date": d.donation_date
            } for d in recent_donations
        ]
    }

@router.get("/requests/pending", response_model=list[schemas.FundraisingRequestOut])
def get_pending_requests(current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    get_admin_record(current_user, db)
    return db.query(models.FundraisingRequest).filter(models.FundraisingRequest.status == "pending").all()

@router.get("/requests/{id}", response_model=schemas.FundraisingRequestOut)
def get_request_by_id(id: int, current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    get_admin_record(current_user, db)
    request = db.query(models.FundraisingRequest).filter(models.FundraisingRequest.request_id == id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Fundraising request not found")
    return request

@router.post("/requests/{id}/verification-checklist", response_model=schemas.VerificationChecklistOut)
def create_verification_checklist(
    id: int, 
    checklist_in: schemas.VerificationChecklistCreate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    admin = get_admin_record(current_user, db)
    request = db.query(models.FundraisingRequest).filter(models.FundraisingRequest.request_id == id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    existing = db.query(models.VerificationChecklist).filter(models.VerificationChecklist.request_id == id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Checklist already exists for this request. Use PUT to update.")

    checklist = models.VerificationChecklist(
        request_id=id,
        admin_id=admin.admin_id,
        student_identity_confirmed=checklist_in.student_identity_confirmed,
        matric_number_confirmed=checklist_in.matric_number_confirmed,
        department_faculty_confirmed=checklist_in.department_faculty_confirmed,
        documents_reviewed=checklist_in.documents_reviewed,
        financial_need_confirmed=checklist_in.financial_need_confirmed,
        requested_amount_reasonable=checklist_in.requested_amount_reasonable,
        duplicate_support_checked=checklist_in.duplicate_support_checked,
        decision_recorded=checklist_in.decision_recorded
    )
    db.add(checklist)
    db.commit()
    db.refresh(checklist)
    return checklist

@router.put("/requests/{id}/verification-checklist", response_model=schemas.VerificationChecklistOut)
def update_verification_checklist(
    id: int,
    checklist_in: schemas.VerificationChecklistCreate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    admin = get_admin_record(current_user, db)
    checklist = db.query(models.VerificationChecklist).filter(models.VerificationChecklist.request_id == id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found for this request")

    checklist.admin_id = admin.admin_id
    checklist.student_identity_confirmed = checklist_in.student_identity_confirmed
    checklist.matric_number_confirmed = checklist_in.matric_number_confirmed
    checklist.department_faculty_confirmed = checklist_in.department_faculty_confirmed
    checklist.documents_reviewed = checklist_in.documents_reviewed
    checklist.financial_need_confirmed = checklist_in.financial_need_confirmed
    checklist.requested_amount_reasonable = checklist_in.requested_amount_reasonable
    checklist.duplicate_support_checked = checklist_in.duplicate_support_checked
    checklist.decision_recorded = checklist_in.decision_recorded
    checklist.reviewed_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(checklist)
    return checklist

@router.get("/requests/{id}/verification-checklist", response_model=schemas.VerificationChecklistOut)
def get_verification_checklist(id: int, current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    get_admin_record(current_user, db)
    checklist = db.query(models.VerificationChecklist).filter(models.VerificationChecklist.request_id == id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found for this request")
    return checklist

@router.put("/requests/{id}/approve", response_model=schemas.FundraisingRequestOut)
def approve_request(
    id: int,
    decision_data: dict,  # expects {"reason": "..."}
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    get_admin_record(current_user, db)
    request = db.query(models.FundraisingRequest).filter(models.FundraisingRequest.request_id == id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.status != "pending":
        raise HTTPException(status_code=400, detail="Request has already been reviewed")

    # A request should not be approved unless the admin verification checklist has been completed
    checklist = db.query(models.VerificationChecklist).filter(models.VerificationChecklist.request_id == id).first()
    if not checklist:
        raise HTTPException(
            status_code=400,
            detail="Cannot approve request: Admin verification checklist has not been created/reviewed yet"
        )
    
    # Check if critical checklist items are confirmed
    checklist_complete = all([
        checklist.student_identity_confirmed,
        checklist.matric_number_confirmed,
        checklist.department_faculty_confirmed,
        checklist.documents_reviewed,
        checklist.financial_need_confirmed,
        checklist.requested_amount_reasonable,
        checklist.duplicate_support_checked
    ])
    if not checklist_complete:
        raise HTTPException(
            status_code=400,
            detail="Cannot approve request: One or more critical checklist items have not been verified"
        )

    reason = decision_data.get("reason", "Approved by Administrator")

    request.status = "approved"
    request.admin_decision_reason = reason
    checklist.decision_recorded = True

    # Get student user ID to send notification
    student_user_id = request.student.user_id
    new_notif = models.Notification(
        user_id=student_user_id,
        title="Fundraising Request Approved",
        message=f"Your request '{request.title}' has been approved and published as an active campaign! Reason: {reason}"
    )
    db.add(new_notif)
    db.commit()
    db.refresh(request)
    return request

@router.put("/requests/{id}/reject", response_model=schemas.FundraisingRequestOut)
def reject_request(
    id: int,
    decision_data: dict,  # expects {"reason": "..."}
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    get_admin_record(current_user, db)
    request = db.query(models.FundraisingRequest).filter(models.FundraisingRequest.request_id == id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.status != "pending":
        raise HTTPException(status_code=400, detail="Request has already been reviewed")

    reason = decision_data.get("reason")
    if not reason:
        raise HTTPException(status_code=400, detail="A rejection reason is required")

    request.status = "rejected"
    request.admin_decision_reason = reason

    # Update checklist status if checklist exists
    checklist = db.query(models.VerificationChecklist).filter(models.VerificationChecklist.request_id == id).first()
    if checklist:
        checklist.decision_recorded = True

    # Notify student
    student_user_id = request.student.user_id
    new_notif = models.Notification(
        user_id=student_user_id,
        title="Fundraising Request Rejected",
        message=f"Your request '{request.title}' was rejected. Reason: {reason}"
    )
    db.add(new_notif)
    db.commit()
    db.refresh(request)
    return request

@router.get("/donations/pending", response_model=list[schemas.DonationRecordOut])
def get_pending_donations(current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    get_admin_record(current_user, db)
    return db.query(models.DonationRecord).filter(models.DonationRecord.verification_status == "pending").all()

@router.put("/donations/{id}/verify", response_model=schemas.DonationRecordOut)
def verify_donation(id: int, current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    admin = get_admin_record(current_user, db)
    donation = db.query(models.DonationRecord).filter(models.DonationRecord.donation_id == id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation record not found")

    if donation.verification_status != "pending":
        raise HTTPException(status_code=400, detail="Donation has already been processed")

    donation.verification_status = "verified"
    donation.verified_by = admin.admin_id
    donation.verified_at = datetime.datetime.utcnow()

    # Update fundraising request progress
    request = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.request_id == donation.request_id
    ).first()
    
    if request:
        request.amount_raised += donation.amount
        if request.amount_raised >= request.amount_needed:
            request.status = "completed"
            
            # Notify student of completion
            student_notif = models.Notification(
                user_id=request.student.user_id,
                title="Campaign Fully Funded!",
                message=f"Congratulations! Your campaign '{request.title}' has reached its target of {request.amount_needed}."
            )
            db.add(student_notif)

        # Notify student of donation
        student_notif = models.Notification(
            user_id=request.student.user_id,
            title="New Donation Verified",
            message=f"An administrator verified a donation of {donation.amount} for your campaign '{request.title}'."
        )
        db.add(student_notif)

    # Notify donor
    donor_user_id = donation.donor.user_id
    donor_notif = models.Notification(
        user_id=donor_user_id,
        title="Donation Verified",
        message=f"Thank you! Your donation of {donation.amount} has been verified by the administrator."
    )
    db.add(donor_notif)

    db.commit()
    db.refresh(donation)
    return donation

@router.put("/donations/{id}/reject", response_model=schemas.DonationRecordOut)
def reject_donation(
    id: int,
    rejection_data: dict,  # expects {"reason": "..."}
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    admin = get_admin_record(current_user, db)
    donation = db.query(models.DonationRecord).filter(models.DonationRecord.donation_id == id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation record not found")

    if donation.verification_status != "pending":
        raise HTTPException(status_code=400, detail="Donation has already been processed")

    reason = rejection_data.get("reason")
    if not reason:
        raise HTTPException(status_code=400, detail="A rejection reason is required")

    donation.verification_status = "rejected"
    donation.verified_by = admin.admin_id
    donation.verified_at = datetime.datetime.utcnow()

    # Notify donor
    donor_user_id = donation.donor.user_id
    donor_notif = models.Notification(
        user_id=donor_user_id,
        title="Donation Proof Rejected",
        message=f"Your donation proof with reference '{donation.transaction_reference}' was rejected. Reason: {reason}"
    )
    db.add(donor_notif)

    db.commit()
    db.refresh(donation)
    return donation

@router.get("/campaigns", response_model=list[schemas.FundraisingRequestOut])
def get_all_campaigns(current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    get_admin_record(current_user, db)
    return db.query(models.FundraisingRequest).order_by(models.FundraisingRequest.date_submitted.desc()).all()

@router.put("/campaigns/{id}", response_model=schemas.FundraisingRequestOut)
def update_campaign_status(
    id: int,
    status_data: dict,  # expects {"status": "..."}
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    get_admin_record(current_user, db)
    request = db.query(models.FundraisingRequest).filter(models.FundraisingRequest.request_id == id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Campaign/Request not found")

    new_status = status_data.get("status")
    if new_status not in ["pending", "approved", "rejected", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status parameter")

    request.status = new_status
    db.commit()
    db.refresh(request)
    return request

@router.get("/reports", response_model=list[schemas.ReportOut])
def get_reports(current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    get_admin_record(current_user, db)
    return db.query(models.Report).order_by(models.Report.date_generated.desc()).all()

@router.post("/reports", response_model=schemas.ReportOut, status_code=status.HTTP_201_CREATED)
def generate_report(
    report_in: schemas.ReportCreate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    admin = get_admin_record(current_user, db)

    new_report = models.Report(
        admin_id=admin.admin_id,
        report_type=report_in.report_type,
        report_description=report_in.report_description
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

@router.get("/users")
def get_users(current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    get_admin_record(current_user, db)
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    
    res = []
    for u in users:
        role_details = {}
        if u.role == "student" and u.student:
            role_details = {
                "matric_number": u.student.matric_number,
                "department": u.student.department,
                "faculty": u.student.faculty,
                "level": u.student.level,
                "status": u.student.student_status
            }
        elif u.role == "donor" and u.donor:
            role_details = {
                "donor_type": u.donor.donor_type,
                "organization_name": u.donor.organization_name,
                "address": u.donor.address
            }
        elif u.role == "admin" and u.admin:
            role_details = {
                "staff_id": u.admin.staff_id,
                "position": u.admin.position
            }
            
        res.append({
            "user_id": u.user_id,
            "full_name": u.full_name,
            "email": u.email,
            "phone_number": u.phone_number,
            "role": u.role,
            "created_at": u.created_at,
            "details": role_details
        })
    return res

@router.put("/donation-account", response_model=schemas.DonationAccountOut)
def update_donation_account(
    account_in: schemas.DonationAccountCreate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    admin = get_admin_record(current_user, db)

    # Let's keep a single active donation account for simplicity, or we can check if one exists and update it, else create one.
    existing = db.query(models.DonationAccount).filter(models.DonationAccount.status == "active").first()
    
    if existing:
        existing.bank_name = account_in.bank_name
        existing.account_name = account_in.account_name
        existing.account_number = account_in.account_number
        existing.payment_instruction = account_in.payment_instruction
        existing.admin_id = admin.admin_id
        existing.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_account = models.DonationAccount(
            admin_id=admin.admin_id,
            bank_name=account_in.bank_name,
            account_name=account_in.account_name,
            account_number=account_in.account_number,
            payment_instruction=account_in.payment_instruction,
            status="active"
        )
        db.add(new_account)
        db.commit()
        db.refresh(new_account)
        return new_account


# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/disbursements", response_model=schemas.DisbursementOut, status_code=status.HTTP_201_CREATED)
def create_disbursement(
    disbursement_in: schemas.DisbursementCreate,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    admin = get_admin_record(current_user, db)
    
    # Check request
    request = db.query(models.FundraisingRequest).filter(
        models.FundraisingRequest.request_id == disbursement_in.request_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Fundraising request not found")
        
    if request.status not in ["approved", "completed"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot disburse funds for requests that are not approved or completed"
        )
        
    # Ensure disbursement does not exceed total amount raised
    total_disbursed_so_far = sum([d.amount_disbursed for d in request.disbursements])
    if total_disbursed_so_far + disbursement_in.amount_disbursed > request.amount_raised:
        raise HTTPException(
            status_code=400,
            detail=f"Disbursement limit exceeded. The campaign raised ₦{request.amount_raised:,.2f}, and ₦{total_disbursed_so_far:,.2f} has already been disbursed. You cannot disburse more than the remaining ₦{(request.amount_raised - total_disbursed_so_far):,.2f}."
        )
        
    new_disbursement = models.Disbursement(
        request_id=disbursement_in.request_id,
        admin_id=admin.admin_id,
        recipient_type=disbursement_in.recipient_type,
        recipient_name=disbursement_in.recipient_name,
        amount_disbursed=disbursement_in.amount_disbursed,
        payment_reference=disbursement_in.payment_reference,
        disbursement_status="disbursed",
        disbursement_notes=disbursement_in.disbursement_notes
    )
    db.add(new_disbursement)
    
    # Mark status as completed if not already
    if request.status != "completed":
        request.status = "completed"
        
    # Notify student
    student_user_id = request.student.user.user_id
    student_notif = models.Notification(
        user_id=student_user_id,
        title="Disbursement Processed",
        message=f"A disbursement of ₦{disbursement_in.amount_disbursed:,.2f} has been processed for your request '{request.title}' directly to {disbursement_in.recipient_name} ({disbursement_in.recipient_type.replace('_', ' ').title()}). Ref: {disbursement_in.payment_reference}."
    )
    db.add(student_notif)
    
    db.commit()
    db.refresh(new_disbursement)
    return new_disbursement

@router.get("/disbursements", response_model=list[schemas.DisbursementOut])
def get_all_disbursements(
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    get_admin_record(current_user, db)
    return db.query(models.Disbursement).order_by(models.Disbursement.disbursed_at.desc()).all()

@router.get("/disbursements/campaign/{request_id}", response_model=list[schemas.DisbursementOut])
def get_campaign_disbursements(
    request_id: int,
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    get_admin_record(current_user, db)
    return db.query(models.Disbursement).filter(
        models.Disbursement.request_id == request_id
    ).order_by(models.Disbursement.disbursed_at.desc()).all()

@router.post("/disbursements/{id}/evidence", response_model=schemas.DisbursementOut)
def upload_disbursement_evidence(
    id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_admin),
    db: Session = Depends(get_db)
):
    get_admin_record(current_user, db)
    disbursement = db.query(models.Disbursement).filter(models.Disbursement.disbursement_id == id).first()
    if not disbursement:
        raise HTTPException(status_code=404, detail="Disbursement record not found")
        
    # Validate file format and size
    validate_upload_file(file)

    # Upload to Cloudinary
    evidence_url = upload_to_cloudinary(file, folder="disbursement_evidence")
    disbursement.evidence_file = evidence_url
    db.commit()
    db.refresh(disbursement)
    return disbursement


# ──────────────────────────────────────────────────
# Super Admin: Invite Link Management
# ──────────────────────────────────────────────────

@router.post("/invite-links", response_model=schemas.AdminInviteTokenOut, status_code=status.HTTP_201_CREATED)
def generate_invite_link(
    current_user: models.User = Depends(auth.get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Super admin generates a one-time invite link for new admin registration."""
    admin = get_admin_record(current_user, db)

    token_value = str(uuid.uuid4())
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=48)

    invite_token = models.AdminInviteToken(
        token=token_value,
        created_by_admin_id=admin.admin_id,
        is_used=False,
        expires_at=expires_at
    )
    db.add(invite_token)
    db.commit()
    db.refresh(invite_token)
    return invite_token


@router.get("/invite-links", response_model=list[schemas.AdminInviteTokenOut])
def list_invite_links(
    current_user: models.User = Depends(auth.get_current_super_admin),
    db: Session = Depends(get_db)
):
    """Super admin lists all invite tokens with their status."""
    get_admin_record(current_user, db)
    return db.query(models.AdminInviteToken).order_by(models.AdminInviteToken.created_at.desc()).all()

