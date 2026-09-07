import datetime
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # student, donor, admin
    account_status = Column(String, default="active")  # active, suspended
    suspended_at = Column(DateTime, nullable=True)
    suspension_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    donor = relationship("Donor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin = relationship("Administrator", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    matric_number = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    faculty = Column(String, nullable=False)
    level = Column(String, nullable=False)
    student_status = Column(String, default="active")  # active, suspended, graduated

    # Relationships
    user = relationship("User", back_populates="student")
    requests = relationship("FundraisingRequest", back_populates="student", cascade="all, delete-orphan")


class Donor(Base):
    __tablename__ = "donors"

    donor_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    donor_type = Column(String, default="individual")  # individual, corporate
    organization_name = Column(String, nullable=True)
    address = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="donor")
    donations = relationship("DonationRecord", back_populates="donor")


class Administrator(Base):
    __tablename__ = "administrators"

    admin_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(String, unique=True, index=True, nullable=False)
    position = Column(String, nullable=False)
    is_super_admin = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="admin")
    checklists = relationship("VerificationChecklist", back_populates="admin")
    donation_accounts = relationship("DonationAccount", back_populates="admin")
    reports = relationship("Report", back_populates="admin")
    verified_donations = relationship("DonationRecord", back_populates="verifier")
    disbursements = relationship("Disbursement", back_populates="admin")
    invite_tokens = relationship("AdminInviteToken", back_populates="created_by_admin")
    activity_logs = relationship("ActivityLog", back_populates="admin")


class FundraisingRequest(Base):
    __tablename__ = "fundraising_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    amount_needed = Column(Numeric(12, 2), nullable=False)
    amount_raised = Column(Numeric(12, 2), default=0)
    purpose = Column(String, nullable=False)
    status = Column(String, default="pending")  # legacy compatibility mirror
    reason_for_request = Column(Text, nullable=False)
    urgency_level = Column(String, nullable=False)  # low, medium, high
    student_bank_name = Column(String, nullable=True)
    student_account_name = Column(String, nullable=True)
    student_account_number = Column(String, nullable=True)
    # Legacy indigence fields retained during the compatibility window.
    parent_or_guardian_occupation = Column(String, nullable=True)
    previous_support_received = Column(String, nullable=True)  # yes, no
    supporting_statement = Column(Text, nullable=False)
    support_need_description = Column(Text, nullable=True)
    functional_impact = Column(Text, nullable=True)
    requested_support_type = Column(String, nullable=True)
    public_story = Column(Text, nullable=True)
    public_display_preference = Column(String, default="first_name_initial")
    public_consent = Column(Boolean, default=False)
    public_consent_at = Column(DateTime, nullable=True)
    application_status = Column(String, default="submitted")  # submitted, under_review, changes_requested, approved, rejected, withdrawn
    campaign_status = Column(String, default="unpublished")  # unpublished, active, paused, funded, closed, cancelled
    admin_decision_reason = Column(Text, nullable=True)
    date_submitted = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="requests")
    documents = relationship("VerificationDocument", back_populates="request", cascade="all, delete-orphan")
    checklist = relationship("VerificationChecklist", back_populates="request", uselist=False, cascade="all, delete-orphan")
    donations = relationship("DonationRecord", back_populates="request", cascade="all, delete-orphan")
    disbursements = relationship("Disbursement", back_populates="request", cascade="all, delete-orphan")


class VerificationDocument(Base):
    __tablename__ = "verification_documents"

    document_id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("fundraising_requests.request_id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String, nullable=False)  # school_fee_invoice, student_id_card, etc.
    file_path = Column(String, nullable=True)  # legacy public URL; migrate to storage_key
    storage_key = Column(String, nullable=True)
    storage_resource_type = Column(String, nullable=True)
    storage_format = Column(String, nullable=True)
    storage_version = Column(Integer, nullable=True)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    request = relationship("FundraisingRequest", back_populates="documents")


class VerificationChecklist(Base):
    __tablename__ = "verification_checklists"

    checklist_id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("fundraising_requests.request_id", ondelete="CASCADE"), nullable=False)
    admin_id = Column(Integer, ForeignKey("administrators.admin_id", ondelete="SET NULL"), nullable=True)
    student_identity_confirmed = Column(Boolean, default=False)
    matric_number_confirmed = Column(Boolean, default=False)
    department_faculty_confirmed = Column(Boolean, default=False)
    documents_reviewed = Column(Boolean, default=False)
    financial_need_confirmed = Column(Boolean, default=False)
    disability_evidence_confirmed = Column(Boolean, default=False)
    support_need_confirmed = Column(Boolean, default=False)
    evidence_pathway = Column(String, nullable=True)
    requested_amount_reasonable = Column(Boolean, default=False)
    duplicate_support_checked = Column(Boolean, default=False)
    decision_recorded = Column(Boolean, default=False)
    reviewed_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    request = relationship("FundraisingRequest", back_populates="checklist")
    admin = relationship("Administrator", back_populates="checklists")


class DonationAccount(Base):
    __tablename__ = "donation_accounts"

    account_id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("administrators.admin_id"), nullable=False)
    bank_name = Column(String, nullable=False)
    account_name = Column(String, nullable=False)
    account_number = Column(String, nullable=False)
    payment_instruction = Column(Text, nullable=False)
    status = Column(String, default="active")  # active, inactive
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    admin = relationship("Administrator", back_populates="donation_accounts")


class DonationRecord(Base):
    __tablename__ = "donation_records"

    donation_id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.donor_id"), nullable=False)
    request_id = Column(Integer, ForeignKey("fundraising_requests.request_id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    transaction_reference = Column(String, unique=True, index=True, nullable=False)
    proof_file = Column(String, nullable=True)  # legacy URL; do not expose directly
    proof_storage_key = Column(String, nullable=True)
    proof_storage_resource_type = Column(String, nullable=True)
    proof_storage_format = Column(String, nullable=True)
    proof_storage_version = Column(Integer, nullable=True)
    donation_date = Column(DateTime, default=datetime.datetime.utcnow)
    verification_status = Column(String, default="pending")  # pending, verified, rejected
    rejection_reason = Column(Text, nullable=True)
    verified_by = Column(Integer, ForeignKey("administrators.admin_id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)

    # Relationships
    donor = relationship("Donor", back_populates="donations")
    request = relationship("FundraisingRequest", back_populates="donations")
    verifier = relationship("Administrator", back_populates="verified_donations")

    @property
    def proof_access_available(self):
        return bool(self.proof_storage_key or self.proof_file)


class Report(Base):
    __tablename__ = "reports"

    report_id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("administrators.admin_id"), nullable=False)
    report_type = Column(String, nullable=False)  # system_summary, etc.
    report_description = Column(Text, nullable=False)
    date_generated = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    admin = relationship("Administrator", back_populates="reports")


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")


class Disbursement(Base):
    __tablename__ = "disbursements"

    disbursement_id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("fundraising_requests.request_id", ondelete="CASCADE"), nullable=False)
    admin_id = Column(Integer, ForeignKey("administrators.admin_id", ondelete="SET NULL"), nullable=True)
    recipient_type = Column(String, nullable=False)  # school, hostel, hospital, vendor, student_exception
    recipient_name = Column(String, nullable=False)
    amount_disbursed = Column(Numeric(12, 2), nullable=False)
    payment_reference = Column(String, nullable=False)
    evidence_file = Column(String, nullable=True)  # legacy URL; do not expose directly
    evidence_storage_key = Column(String, nullable=True)
    evidence_storage_resource_type = Column(String, nullable=True)
    evidence_storage_format = Column(String, nullable=True)
    evidence_storage_version = Column(Integer, nullable=True)
    disbursement_status = Column(String, default="disbursed")  # pending, disbursed, failed
    disbursement_notes = Column(Text, nullable=True)
    disbursed_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    request = relationship("FundraisingRequest", back_populates="disbursements")
    admin = relationship("Administrator", back_populates="disbursements")

    @property
    def evidence_access_available(self):
        return bool(self.evidence_storage_key or self.evidence_file)


class AdminInviteToken(Base):
    __tablename__ = "admin_invite_tokens"

    token_id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    created_by_admin_id = Column(Integer, ForeignKey("administrators.admin_id"), nullable=True)
    is_used = Column(Boolean, default=False)
    used_by_user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    created_by_admin = relationship("Administrator", back_populates="invite_tokens")
    used_by_user = relationship("User")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("administrators.admin_id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=True)
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    admin = relationship("Administrator", back_populates="activity_logs")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    token_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")
