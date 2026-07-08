from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Profile Base
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str

class UserCreate(UserBase):
    password: str
    role: str  # student, donor (admin registration is invite-only)
    
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
    file_path: str
    upload_date: datetime

    class Config:
        from_attributes = True

# Checklist schemas
class VerificationChecklistBase(BaseModel):
    student_identity_confirmed: bool = False
    matric_number_confirmed: bool = False
    department_faculty_confirmed: bool = False
    documents_reviewed: bool = False
    financial_need_confirmed: bool = False
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
    amount_needed: float = Field(..., gt=0)
    purpose: str
    reason_for_request: str
    urgency_level: str  # low, medium, high
    student_bank_name: Optional[str] = None
    student_account_name: Optional[str] = None
    student_account_number: Optional[str] = None
    parent_or_guardian_occupation: str
    previous_support_received: str  # yes, no
    supporting_statement: str

class FundraisingRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amount_needed: Optional[float] = None
    purpose: Optional[str] = None
    reason_for_request: Optional[str] = None
    urgency_level: Optional[str] = None
    student_bank_name: Optional[str] = None
    student_account_name: Optional[str] = None
    student_account_number: Optional[str] = None
    parent_or_guardian_occupation: Optional[str] = None
    previous_support_received: Optional[str] = None
    supporting_statement: Optional[str] = None

class FundraisingRequestOut(BaseModel):
    request_id: int
    student_id: int
    title: str
    description: str
    amount_needed: float
    amount_raised: float
    purpose: str
    status: str
    reason_for_request: str
    urgency_level: str
    student_bank_name: Optional[str] = None
    student_account_name: Optional[str] = None
    student_account_number: Optional[str] = None
    parent_or_guardian_occupation: str
    previous_support_received: str
    supporting_statement: str
    admin_decision_reason: Optional[str]
    date_submitted: datetime
    student: Optional[StudentOut] = None
    documents: List[VerificationDocumentOut] = []
    checklist: Optional[VerificationChecklistOut] = None

    class Config:
        from_attributes = True


class UserPublicOut(BaseModel):
    full_name: str

    class Config:
        from_attributes = True


class StudentPublicOut(BaseModel):
    student_id: int
    department: str
    faculty: str
    level: str
    user: UserPublicOut

    class Config:
        from_attributes = True


class CampaignPublicOut(BaseModel):
    request_id: int
    student_id: int
    title: str
    description: str
    amount_needed: float
    amount_raised: float
    purpose: str
    status: str
    reason_for_request: str
    urgency_level: str
    parent_or_guardian_occupation: str
    previous_support_received: str
    supporting_statement: str
    admin_decision_reason: Optional[str] = None
    date_submitted: datetime
    student: Optional[StudentPublicOut] = None

    class Config:
        from_attributes = True


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
    amount: float = Field(..., gt=0)
    transaction_reference: str

class DonationRecordOut(BaseModel):
    donation_id: int
    donor_id: int
    request_id: int
    amount: float
    transaction_reference: str
    proof_file: Optional[str] = None
    donation_date: datetime
    verification_status: str
    verified_by: Optional[int]
    verified_at: Optional[datetime]
    donor: Optional[DonorOut] = None
    request: Optional[FundraisingRequestOut] = None

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
    amount_disbursed: float = Field(..., gt=0)
    payment_reference: str
    disbursement_notes: Optional[str] = None

class DisbursementOut(BaseModel):
    disbursement_id: int
    request_id: int
    admin_id: Optional[int] = None
    recipient_type: str
    recipient_name: str
    amount_disbursed: float
    payment_reference: str
    evidence_file: Optional[str] = None
    disbursement_status: str
    disbursement_notes: Optional[str] = None
    disbursed_at: datetime

    class Config:
        from_attributes = True


# Admin invite token schemas
class AdminInviteTokenOut(BaseModel):
    token_id: int
    token: str
    created_by_admin_id: int
    is_used: bool
    used_by_user_id: Optional[int] = None
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class AdminRegisterViaInvite(BaseModel):
    token: str
    full_name: str
    email: EmailStr
    phone_number: str
    password: str
    staff_id: str
    position: str
