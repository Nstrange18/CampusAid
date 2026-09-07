import os
import sys
import datetime

# Add parent directory to path to allow import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine, Base
from backend import models, auth

def seed_db():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if database is already seeded
    if db.query(models.User).first() is not None:
        print("Database already contains data, skipping seeding.")
        db.close()
        return

    print("Seeding database...")
    
    # 1. Create Admins
    admin_pwd = auth.get_password_hash("admin123")
    admin_user = models.User(
        full_name="Academic Administrator",
        email="admin@campusaid.edu",
        phone_number="+2348011223344",
        password_hash=admin_pwd,
        role="admin"
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    admin_profile = models.Administrator(
        user_id=admin_user.user_id,
        staff_id="STF/2026/001",
        position="Dean of Student Affairs",
        is_super_admin=True
    )
    db.add(admin_profile)
    db.commit()
    db.refresh(admin_profile)
    
    # 2. Create Active Admin Donation Account
    donation_account = models.DonationAccount(
        admin_id=admin_profile.admin_id,
        bank_name="Campus Trust Bank",
        account_name="CampusAid Welfare Fund",
        account_number="1012345678",
        payment_instruction="Kindly specify 'CampusAid Student Support' as the bank transfer memo. Ensure you capture a screenshot of your transaction receipt.",
        status="active"
    )
    db.add(donation_account)
    db.commit()
    
    # 3. Create Students
    student_pwd = auth.get_password_hash("student123")
    
    # Student 1: John Doe (Pending request)
    student1_user = models.User(
        full_name="John Doe",
        email="john.doe@campusaid.edu",
        phone_number="+2348022334455",
        password_hash=student_pwd,
        role="student"
    )
    db.add(student1_user)
    db.commit()
    db.refresh(student1_user)
    
    student1_profile = models.Student(
        user_id=student1_user.user_id,
        matric_number="UG/20/CSC/1042",
        department="Computer Science",
        faculty="Physical Sciences",
        level="400 Level",
        student_status="active"
    )
    db.add(student1_profile)
    db.commit()
    db.refresh(student1_profile)
    
    # Student 2: Jane Smith (Approved request / Campaign)
    student2_user = models.User(
        full_name="Jane Smith",
        email="jane.smith@campusaid.edu",
        phone_number="+2348033445566",
        password_hash=student_pwd,
        role="student"
    )
    db.add(student2_user)
    db.commit()
    db.refresh(student2_user)
    
    student2_profile = models.Student(
        user_id=student2_user.user_id,
        matric_number="UG/21/MEG/2081",
        department="Mechanical Engineering",
        faculty="Engineering",
        level="300 Level",
        student_status="active"
    )
    db.add(student2_profile)
    db.commit()
    db.refresh(student2_profile)
    
    # 4. Create Fundraising Requests
    
    # Request 1 (Pending review by Admin)
    request1 = models.FundraisingRequest(
        student_id=student1_profile.student_id,
        title="Screen Reader and Accessible Laptop Support",
        description="I need compatible assistive technology to access course materials and complete programming assignments independently.",
        amount_needed=420000.0,
        amount_raised=0.0,
        purpose="Assistive Technology",
        status="pending",
        reason_for_request="My current device does not support the screen-reader and development tools required for coursework.",
        urgency_level="high",
        student_bank_name="Campus Trust Bank",
        student_account_name="John Doe",
        student_account_number="2081234567",
        supporting_statement="This equipment will let me access course materials and complete assignments independently.",
        support_need_description="A screen-reader-compatible laptop, licensed accessibility software, and setup support.",
        functional_impact="A visual impairment makes inaccessible course documents and shared laboratory computers difficult to use.",
        requested_support_type="Assistive technology",
        public_story="This campaign will provide accessible study technology that supports independent learning and participation.",
        public_display_preference="first_name_initial",
        public_consent=True,
        public_consent_at=datetime.datetime.utcnow(),
        application_status="submitted",
        campaign_status="unpublished"
    )
    db.add(request1)
    db.commit()
    db.refresh(request1)
    
    # Documents for Request 1
    doc1 = models.VerificationDocument(
        request_id=request1.request_id,
        document_type="assistive_device_quote",
        file_path="/uploads/sample_invoice.pdf"
    )
    doc2 = models.VerificationDocument(
        request_id=request1.request_id,
        document_type="student_id_card",
        file_path="/uploads/sample_id.png"
    )
    db.add(doc1)
    db.add(doc2)
    db.commit()
    
    # Request 2 (Already Approved -> Active Campaign)
    request2 = models.FundraisingRequest(
        student_id=student2_profile.student_id,
        title="Mobility Support for Engineering Student",
        description="I need a suitable mobility aid and accessible transport support for laboratories and lectures across campus.",
        amount_needed=350000.0,
        amount_raised=0.0,
        purpose="Mobility Support",
        status="approved",
        reason_for_request="My current mobility aid is no longer suitable for moving safely between lecture halls and laboratories.",
        urgency_level="medium",
        student_bank_name="Access Bank",
        student_account_name="Jane Smith",
        student_account_number="0098765432",
        supporting_statement="Reliable mobility support will help me attend laboratories and lectures consistently.",
        support_need_description="A fitted mobility aid plus accessible campus transport support.",
        functional_impact="A lower-limb mobility disability limits safe travel across campus and access to engineering laboratories.",
        requested_support_type="Mobility support",
        public_story="This campaign will fund mobility support that enables consistent access to lectures and practical laboratories.",
        public_display_preference="anonymous",
        public_consent=True,
        public_consent_at=datetime.datetime.utcnow(),
        application_status="approved",
        campaign_status="active",
        admin_decision_reason="Eligibility, support need, cost, consent, and an accepted evidence pathway were verified."
    )
    db.add(request2)
    db.commit()
    db.refresh(request2)
    
    # Add Checklist for Request 2 (Approved, so checklist must exist)
    checklist2 = models.VerificationChecklist(
        request_id=request2.request_id,
        admin_id=admin_profile.admin_id,
        student_identity_confirmed=True,
        matric_number_confirmed=True,
        department_faculty_confirmed=True,
        documents_reviewed=True,
        financial_need_confirmed=False,
        disability_evidence_confirmed=True,
        support_need_confirmed=True,
        evidence_pathway="university_support_office",
        requested_amount_reasonable=True,
        duplicate_support_checked=True,
        decision_recorded=True
    )
    db.add(checklist2)
    db.commit()
    
    # Documents for Request 2
    doc3 = models.VerificationDocument(
        request_id=request2.request_id,
        document_type="university_support_office",
        file_path="/uploads/sample_hostel.png"
    )
    db.add(doc3)
    db.commit()

    # 5. Create Donors
    donor_pwd = auth.get_password_hash("donor123")
    donor_user = models.User(
        full_name="Alumni Contributor",
        email="donor@alumni.org",
        phone_number="+15550192837",
        password_hash=donor_pwd,
        role="donor"
    )
    db.add(donor_user)
    db.commit()
    db.refresh(donor_user)
    
    donor_profile = models.Donor(
        user_id=donor_user.user_id,
        donor_type="individual",
        organization_name=None,
        address="Austin, Texas"
    )
    db.add(donor_profile)
    db.commit()
    db.refresh(donor_profile)

    # 6. Create a Pending Donation for Request 2 (Approved Campaign)
    donation = models.DonationRecord(
        donor_id=donor_profile.donor_id,
        request_id=request2.request_id,
        amount=25000.0,
        transaction_reference="REF/CAMPUSAID/2026/90281",
        proof_file="/uploads/sample_receipt.png",
        verification_status="pending"
    )
    db.add(donation)
    db.commit()
    
    # 7. Create some seed notifications
    notif1 = models.Notification(
        user_id=student1_user.user_id,
        title="Welcome to CampusAid",
        message="Your student profile has been registered. You can now submit a fundraising request."
    )
    notif2 = models.Notification(
        user_id=student2_user.user_id,
        title="Fundraising Request Approved",
        message="Your request 'Engineering Textbook and Accommodation Fund' has been approved and published to donors."
    )
    db.add(notif1)
    db.add(notif2)
    db.commit()

    print("Database seeding completed successfully.")
    db.close()

if __name__ == "__main__":
    seed_db()
