import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
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
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    donor = relationship("Donor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin = relationship("Administrator", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


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

    # Relationships
    user = relationship("User", back_populates="admin")
    checklists = relationship("VerificationChecklist", back_populates="admin")
    donation_accounts = relationship("DonationAccount", back_populates="admin")
    reports = relationship("Report", back_populates="admin")
    verified_donations = relationship("DonationRecord", back_populates="verifier")
    disbursements = relationship("Disbursement", back_populates="admin")


class FundraisingRequest(Base):
    __tablename__ = "fundraising_requests"

    request_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    amount_needed = Column(Float, nullable=False)
    amount_raised = Column(Float, default=0.0)
    purpose = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, approved, rejected, completed
    reason_for_request = Column(Text, nullable=False)
    urgency_level = Column(String, nullable=False)  # low, medium, high
    student_bank_name = Column(String, nullable=True)
    student_account_name = Column(String, nullable=True)
    student_account_number = Column(String, nullable=True)
    parent_or_guardian_occupation = Column(String, nullable=False)
    previous_support_received = Column(String, nullable=False)  # yes, no
    supporting_statement = Column(Text, nullable=False)
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
    file_path = Column(String, nullable=False)
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
    amount = Column(Float, nullable=False)
    transaction_reference = Column(String, unique=True, index=True, nullable=False)
    proof_file = Column(String, nullable=True)
    donation_date = Column(DateTime, default=datetime.datetime.utcnow)
    verification_status = Column(String, default="pending")  # pending, verified, rejected
    verified_by = Column(Integer, ForeignKey("administrators.admin_id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)

    # Relationships
    donor = relationship("Donor", back_populates="donations")
    request = relationship("FundraisingRequest", back_populates="donations")
    verifier = relationship("Administrator", back_populates="verified_donations")


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
    amount_disbursed = Column(Float, nullable=False)
    payment_reference = Column(String, nullable=False)
    evidence_file = Column(String, nullable=True)
    disbursement_status = Column(String, default="disbursed")  # pending, disbursed, failed
    disbursement_notes = Column(Text, nullable=True)
    disbursed_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    request = relationship("FundraisingRequest", back_populates="disbursements")
    admin = relationship("Administrator", back_populates="disbursements")
