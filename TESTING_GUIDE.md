# CampusAid disability-support testing guide

This checklist is for the isolated local review environment. It uses demo data, not the original project database.

## Open the app

- Frontend: `http://localhost:5174`
- Backend API documentation: `http://127.0.0.1:8000/docs`

Port 5174 is being used because another local process already occupies port 5173.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Super administrator | `admin@campusaid.edu` | `admin123` |
| Student | `john.doe@campusaid.edu` | `student123` |
| Approved-campaign student | `jane.smith@campusaid.edu` | `student123` |
| Donor | `donor@alumni.org` | `donor123` |

These credentials are demo-only and must not be used in production.

## 1. Public pages

1. Open the landing page without signing in.
2. Confirm the wording refers to students with physical disabilities and disability-related support.
3. Open the campaign listing and the seeded campaign.
4. Confirm only the public story, campaign purpose, requested support type, selected beneficiary name, target, and amount raised appear.
5. Confirm there are no diagnoses, functional-impact statements, bank details, uploaded evidence, or administrator notes.

## 2. Registration and login

1. Open registration and confirm the only public roles are Student and Donor.
2. Try a password shorter than eight characters and confirm it is rejected.
3. Register a throwaway student or donor if desired.
4. Log in and log out once, then log in again to confirm session handling works.

Administrator creation should only be available through a super-administrator invitation.

## 3. Student application

1. Sign in as `john.doe@campusaid.edu`.
2. Open the student dashboard and confirm the application and campaign statuses are displayed separately.
3. Start a new application.
4. Confirm the form separates:
   - private application background;
   - private support need;
   - private functional impact;
   - requested support type;
   - public campaign story;
   - public name preference and consent;
   - optional private disbursement details.
5. Confirm submitting without public consent is blocked.
6. Submit a demo application with consent.
7. On the evidence page, confirm the accepted evidence choices are alternatives rather than a requirement to upload every type.
8. If Cloudinary is configured, upload a throwaway PDF, PNG, or JPEG under 5 MB and confirm it appears without exposing a permanent URL.
9. Try an unsupported file type or a renamed fake PDF and confirm it is rejected.

Uploading in step 8 writes the throwaway file to the configured Cloudinary account.

## 4. Administrator review

1. Sign out and sign in as `admin@campusaid.edu`.
2. Open Requests and review the new student application.
3. Confirm private fields are visible here but were absent from public campaign pages.
4. Open uploaded evidence and confirm it is delivered through a temporary access link.
5. Complete the checklist using one selected evidence pathway.
6. Confirm the mandatory identity, evidence, support-need, amount, duplication, and decision checks are required.
7. Test requesting changes or rejecting an application and confirm a reason is required.
8. For an approved test application, approve it and then publish/activate its campaign.
9. Confirm the campaign becomes publicly visible only after approval, publication, consent, and a valid public story.

## 5. Donor and donation flow

1. Sign out and sign in as `donor@alumni.org`.
2. Open the campaign listing and select an active campaign.
3. Confirm a donation above the remaining target is rejected.
4. Create a valid demo donation and upload a throwaway receipt if Cloudinary is configured.
5. Open Donation History and confirm the donor sees only the campaign summary and their own receipt-access button.
6. Confirm donors cannot open administrator URLs.

## 6. Donation verification

1. Sign back in as the administrator.
2. Open the pending donation queue.
3. Open the receipt through the temporary access button.
4. Reject one test record and confirm the rejection reason reaches the donor.
5. Verify another test record and confirm the campaign total increases once only.
6. Confirm an already reviewed donation cannot be processed a second time.
7. Confirm a donation cannot push the verified campaign amount above its target.

## 7. Disbursement flow

1. As the super administrator, open the Disbursements area.
2. Confirm ordinary administrators can view records but only a super administrator can create disbursements or upload evidence.
3. Confirm duplicate payment references and amounts above the raised balance are rejected.
4. Record a partial disbursement and confirm the campaign does not close.
5. Record the final disbursement and confirm a fully funded campaign closes.
6. Upload throwaway evidence and confirm it opens through a temporary authenticated link.

## 8. Responsive and final checks

1. Repeat the public campaign, student form, admin review, and donor history pages at a narrow/mobile browser width.
2. Toggle dark mode if available and check text, cards, forms, and dialogs.
3. Confirm long campaign titles and descriptions do not overflow.
4. Refresh each dashboard and confirm its state remains correct.
5. Check that no screen uses indigence, poverty, or financial-hardship verification wording.

## Automated checks already completed

- All nine backend regression tests passed.
- The production frontend build passed.
- Frontend lint completed with non-blocking existing warnings.
- The complete migration chain passed against a fresh database and a disposable copy of the old database.
- Public campaigns were checked for private-field leakage.
- Donation history was checked for private request and raw receipt URL leakage.
- Student, donor, and administrator demo logins succeeded.
- A donor was denied access to an administrator route.
- Public administrator registration was rejected.
