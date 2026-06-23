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
        position="Dean of Student Affairs"
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
        title="Final Semester Tuition Fee Support",
        description="I am a final year Computer Science student who is currently at risk of dropping out due to unpaid tuition fees of 120,000 NGN. My family is experiencing severe financial hardship, and my course adviser recommended I apply.",
        amount_needed=120000.0,
        amount_raised=0.0,
        purpose="Tuition Fees",
        status="pending",
        reason_for_request="Parent laid off due to company downsizing, unable to pay final semester fee invoice.",
        urgency_level="high",
        student_bank_name="Campus Trust Bank",
        student_account_name="John Doe",
        student_account_number="2081234567",
        parent_or_guardian_occupation="Unemployed (formerly Civil Servant)",
        previous_support_received="no",
        supporting_statement="Thank you for considering my request. Supporting me will allow me to graduate and support my family."
    )
    db.add(request1)
    db.commit()
    db.refresh(request1)
    
    # Documents for Request 1
    doc1 = models.VerificationDocument(
        request_id=request1.request_id,
        document_type="school_fee_invoice",
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
        title="Engineering Textbook and Accommodation Fund",
        description="I need assistance to purchase required textbooks for my core engineering courses and to clear my pending hostel accommodation fees. The total cost is 75,000 NGN.",
        amount_needed=75000.0,
        amount_raised=0.0,
        purpose="Books & Accommodation",
        status="approved",
        reason_for_request="Orphaned student relying on part-time tutoring jobs which do not cover books and accommodation bills.",
        urgency_level="medium",
        student_bank_name="Access Bank",
        student_account_name="Jane Smith",
        student_account_number="0098765432",
        parent_or_guardian_occupation="Deceased",
        previous_support_received="yes",
        supporting_statement="Completing my studies is my path to becoming self-sufficient. This scholarship will ensure I have a safe roof and the necessary materials.",
        admin_decision_reason="Verified orphan status, academic transcripts are outstanding, requested amount is minimal and reasonable."
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
        financial_need_confirmed=True,
        requested_amount_reasonable=True,
        duplicate_support_checked=True,
        decision_recorded=True
    )
    db.add(checklist2)
    db.commit()
    
    # Documents for Request 2
    doc3 = models.VerificationDocument(
        request_id=request2.request_id,
        document_type="accommodation_bill",
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
