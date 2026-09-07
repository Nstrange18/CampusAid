import io
import unittest
from datetime import datetime
from decimal import Decimal
from types import SimpleNamespace

from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers

from backend.routes.campaigns import public_campaign
from backend.schemas import DonationRecordCreate, DonationRecordOut, FundraisingRequestCreate, UserCreate
from backend.utils import validate_upload_file


def upload(filename: str, content_type: str, content: bytes) -> UploadFile:
    return UploadFile(
        file=io.BytesIO(content),
        filename=filename,
        headers=Headers({"content-type": content_type}),
    )


class UploadValidationTests(unittest.TestCase):
    def test_valid_pdf_signature_is_accepted(self):
        validate_upload_file(upload("evidence.pdf", "application/pdf", b"%PDF-1.7\ncontent"))

    def test_mismatched_file_signature_is_rejected(self):
        with self.assertRaises(HTTPException):
            validate_upload_file(upload("evidence.pdf", "application/pdf", b"not really a pdf"))

    def test_office_documents_are_rejected(self):
        with self.assertRaises(HTTPException):
            validate_upload_file(
                upload(
                    "evidence.docx",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    b"PK\x03\x04",
                )
            )


class PublicCampaignPrivacyTests(unittest.TestCase):
    def test_public_campaign_excludes_private_application_data(self):
        request = SimpleNamespace(
            request_id=12,
            title="Mobility support",
            public_story="An approved public story.",
            amount_needed=Decimal("1000.00"),
            amount_raised=Decimal("250.00"),
            purpose="Mobility support",
            campaign_status="active",
            urgency_level="medium",
            requested_support_type="Mobility support",
            public_display_preference="anonymous",
            date_submitted=datetime(2026, 9, 6),
            reason_for_request="private reason",
            functional_impact="private functional information",
            student=SimpleNamespace(user=SimpleNamespace(full_name="Private Student")),
        )

        result = public_campaign(request)

        self.assertEqual(result["beneficiary_display_name"], "Anonymous student")
        self.assertNotIn("reason_for_request", result)
        self.assertNotIn("functional_impact", result)
        self.assertNotIn("student", result)

    def test_donation_response_contains_only_a_safe_campaign_summary(self):
        donation = DonationRecordOut.model_validate({
            "donation_id": 3,
            "donor_id": 4,
            "request_id": 12,
            "amount": "250.00",
            "transaction_reference": "TX-SAFE",
            "donation_date": datetime(2026, 9, 6),
            "verification_status": "pending",
            "verified_by": None,
            "verified_at": None,
            "proof_file": "https://storage.example/private-legacy-url",
            "proof_access_available": True,
            "request": {
                "request_id": 12,
                "title": "Mobility support",
                "purpose": "Mobility support",
                "functional_impact": "must not be serialized",
                "student_bank_account": "must not be serialized",
            },
        })

        payload = donation.model_dump()
        self.assertEqual(set(payload["request"]), {"request_id", "title", "purpose"})
        self.assertNotIn("functional_impact", payload["request"])
        self.assertNotIn("proof_file", payload)
        self.assertTrue(payload["proof_access_available"])


class RegistrationValidationTests(unittest.TestCase):
    def test_public_registration_rejects_unrecognized_and_admin_roles(self):
        base = {
            "full_name": "Example User",
            "email": "person@example.com",
            "phone_number": "08000000000",
            "password": "strong-pass",
        }
        for role in ("admin", "super_admin", "anything"):
            with self.subTest(role=role), self.assertRaises(ValueError):
                UserCreate(**base, role=role)

    def test_registration_requires_minimum_password_length(self):
        with self.assertRaises(ValueError):
            UserCreate(
                full_name="Example User",
                email="person@example.com",
                phone_number="08000000000",
                password="short",
                role="donor",
            )


class CurrencyValidationTests(unittest.TestCase):
    def test_currency_is_limited_to_two_decimal_places(self):
        donation = DonationRecordCreate(request_id=1, amount="1250.50", transaction_reference="TX-1")
        self.assertEqual(donation.amount, Decimal("1250.50"))

        with self.assertRaises(ValueError):
            DonationRecordCreate(request_id=1, amount="10.999", transaction_reference="TX-2")

    def test_disability_application_requires_new_private_fields(self):
        with self.assertRaises(ValueError):
            FundraisingRequestCreate(
                title="Support",
                description="A detailed campaign description",
                amount_needed="1000.00",
                purpose="Mobility support",
                reason_for_request="Legacy reason",
                urgency_level="medium",
                supporting_statement="Public story",
            )


if __name__ == "__main__":
    unittest.main()
