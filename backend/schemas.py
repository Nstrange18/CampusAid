from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal, Optional
from datetime import datetime
from decimal import Decimal

# Token Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Profile Base
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: Literal["student", "donor"]
    
    # Optional fields for student, donor, admin registration details
    # Student specific
    matric_number: Optional[str] = None
    department: Optional[str] = None
    faculty: Optional[str] = None
    level: Optional[str] = None
    # Donor specific
    donor_type: Optional[str] = "individual"
    organization_name: Optional[str] = None
    address: Optional[str] = None
    # Admin specific
    staff_id: Optional[str] = None
    position: Optional[str] = None

class UserOut(UserBase):
    user_id: int
    role: str
    account_status: str = "active"
    suspended_at: Optional[datetime] = None
    suspension_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Student schemas
class StudentBase(BaseModel):
    matric_number: str
    department: str
    faculty: str
    level: str

class StudentUpdate(BaseModel):
    matric_number: Optional[str] = None
    department: Optional[str] = None
    faculty: Optional[str] = None
    level: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

class StudentOut(StudentBase):
    student_id: int
    user_id: int
    student_status: str
    user: UserOut

    class Config:
        from_attributes = True

# Donor schemas
class DonorBase(BaseModel):
    donor_type: str
    organization_name: Optional[str] = None
    address: Optional[str] = None

class DonorOut(DonorBase):
    donor_id: int
    user_id: int
    user: UserOut

    class Config:
        from_attributes = True

# Administrator schemas
class AdministratorBase(BaseModel):
    staff_id: str
    position: str

class AdministratorOut(AdministratorBase):
    admin_id: int
    user_id: int
    user: UserOut

    class Config:
        from_attributes = True

# Document schemas
class VerificationDocumentOut(BaseModel):
    document_id: int
    request_id: int
    document_type: str
    upload_date: datetime
    private_access_available: bool = True

    class Config:
        from_attributes = True

# Checklist schemas
class VerificationChecklistBase(BaseModel):
    student_identity_confirmed: bool = False
    matric_number_confirmed: bool = False
    department_faculty_confirmed: bool = False
    documents_reviewed: bool = False
    financial_need_confirmed: bool = False
    disability_evidence_confirmed: bool = False
    support_need_confirmed: bool = False
    evidence_pathway: Optional[str] = None
    requested_amount_reasonable: bool = False
    duplicate_support_checked: bool = False
    decision_recorded: bool = False

class VerificationChecklistCreate(VerificationChecklistBase):
    pass

class VerificationChecklistOut(VerificationChecklistBase):
    checklist_id: int
    request_id: int
    admin_id: Optional[int]
    reviewed_at: datetime

    class Config:
        from_attributes = True

# Request schemas
class FundraisingRequestCreate(BaseModel):
    title: str
    description: str
    amount_needed: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    purpose: str
    reason_for_request: str
    urgency_level: str  # low, medium, high
    student_bank_name: Optional[str] = None
    student_account_name: Optional[str] = None
    student_account_number: Optional[str] = None
    parent_or_guardian_occupation: Optional[str] = None  # legacy
    previous_support_received: Optional[str] = None  # legacy
    supporting_statement: str
    support_need_description: str
    functional_impact: str
    requested_support_type: str
    public_story: Optional[str] = None
    public_display_preference: str = "first_name_initial"
    public_consent: bool = False

class FundraisingRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amount_needed: Optional[Decimal] = Field(None, gt=0, max_digits=12, decimal_places=2)
    purpose: Optional[str] = None
    reason_for_request: Optional[str] = None
    urgency_level: Optional[str] = None
    student_bank_name: Optional[str] = None
    student_account_name: Optional[str] = None
    student_account_number: Optional[str] = None
    parent_or_guardian_occupation: Optional[str] = None
    previous_support_received: Optional[str] = None
    supporting_statement: Optional[str] = None
    support_need_description: Optional[str] = None
    functional_impact: Optional[str] = None
    requested_support_type: Optional[str] = None
    public_story: Optional[str] = None
    public_display_preference: Optional[str] = None
    public_consent: Optional[bool] = None

class FundraisingRequestOut(BaseModel):
    request_id: int
    student_id: int
    title: str
    description: str
    amount_needed: Decimal
    amount_raised: Decimal
    purpose: str
    status: str
    reason_for_request: str
    urgency_level: str
    student_bank_name: Optional[str] = None
    student_account_name: Optional[str] = None
    student_account_number: Optional[str] = None
    parent_or_guardian_occupation: Optional[str] = None
    previous_support_received: Optional[str] = None
    supporting_statement: str
    support_need_description: Optional[str] = None
    functional_impact: Optional[str] = None
    requested_support_type: Optional[str] = None
    public_story: Optional[str] = None
    public_display_preference: str = "first_name_initial"
    public_consent: bool = False
    public_consent_at: Optional[datetime] = None
    application_status: str = "submitted"
    campaign_status: str = "unpublished"
    admin_decision_reason: Optional[str]
    date_submitted: datetime
    student: Optional[StudentOut] = None
    documents: List[VerificationDocumentOut] = []
    checklist: Optional[VerificationChecklistOut] = None

    class Config:
        from_attributes = True


class CampaignPublicOut(BaseModel):
    request_id: int
    title: str
    description: str
    amount_needed: Decimal
    amount_raised: Decimal
    purpose: str
    status: str
    urgency_level: str
    requested_support_type: Optional[str] = None
    beneficiary_display_name: str
    date_submitted: datetime


# Donation Account schemas
class DonationAccountCreate(BaseModel):
    bank_name: str
    account_name: str
    account_number: str
    payment_instruction: str

class DonationAccountOut(DonationAccountCreate):
    account_id: int
    admin_id: int
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True

# Donation Record schemas
class DonationRecordCreate(BaseModel):
    request_id: int
    amount: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    transaction_reference: str


class DonationRequestSummaryOut(BaseModel):
    request_id: int
    title: str
    purpose: str

    class Config:
        from_attributes = True

class DonationRecordOut(BaseModel):
    donation_id: int
    donor_id: int
    request_id: int
    amount: Decimal
    transaction_reference: str
    proof_access_available: bool = False
    donation_date: datetime
    verification_status: str
    rejection_reason: Optional[str] = None
    verified_by: Optional[int]
    verified_at: Optional[datetime]
    donor: Optional[DonorOut] = None
    # Deliberately limited: donors must never receive the student's private
    # application, evidence metadata, banking details, or admin review notes.
    request: Optional[DonationRequestSummaryOut] = None

    class Config:
        from_attributes = True

# Report schemas
class ReportCreate(BaseModel):
    report_type: str
    report_description: str

class ReportOut(ReportCreate):
    report_id: int
    admin_id: int
    date_generated: datetime

    class Config:
        from_attributes = True

# Notification schemas
class NotificationOut(BaseModel):
    notification_id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Disbursement schemas
class DisbursementCreate(BaseModel):
    request_id: int
    recipient_type: str  # school, hostel, hospital, vendor, student_exception
    recipient_name: str
    amount_disbursed: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    payment_reference: str
    disbursement_notes: Optional[str] = None

class DisbursementOut(BaseModel):
    disbursement_id: int
    request_id: int
    admin_id: Optional[int] = None
    recipient_type: str
    recipient_name: str
    amount_disbursed: Decimal
    payment_reference: str
    evidence_access_available: bool = False
    disbursement_status: str
    disbursement_notes: Optional[str] = None
    disbursed_at: datetime

    class Config:
        from_attributes = True


# Admin invite token schemas
class AdminInviteTokenOut(BaseModel):
    token_id: int
    token: str
    created_by_admin_id: Optional[int] = None
    is_used: bool
    used_by_user_id: Optional[int] = None
    revoked_at: Optional[datetime] = None
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class AdminRegisterViaInvite(BaseModel):
    token: str
    full_name: str
    email: EmailStr
    phone_number: str
    password: str = Field(..., min_length=8)
    staff_id: str
    position: str


class UserStatusUpdate(BaseModel):
    reason: Optional[str] = None


class ActivityLogOut(BaseModel):
    log_id: int
    admin_id: Optional[int] = None
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PrivateDocumentAccessOut(BaseModel):
    url: str
    expires_at: datetime
