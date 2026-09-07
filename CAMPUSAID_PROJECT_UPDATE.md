# CampusAid Project Update

## Update summary

CampusAid has been updated from a fundraising management system for indigent students to a disability-support fundraising system for students with physical disabilities.

The completed changes have been merged into the `main` branch and deployed to the CampusAid backend. The production database was upgraded without deleting existing user accounts.

## Revised system purpose

CampusAid now supports the following process:

1. A student registers or signs in.
2. The student submits a disability-related support application.
3. The student provides suitable verification evidence.
4. An administrator privately reviews the application and evidence.
5. An approved application can be published as a fundraising campaign.
6. Donors view approved public campaigns and record their donations.
7. Donors upload proof of payment for administrator verification.
8. A super administrator records and tracks the disbursement of verified funds.

## Main changes

### Student applications

The application now collects:

- The disability-related support being requested
- How the physical disability or accessibility barrier affects the student's studies
- The type of support required
- A private application background for administrators
- A separate public campaign story for donors
- The student's preferred public name format
- Explicit consent to publish the approved campaign story
- Optional private payment details for exceptional disbursements

Private medical, disability, academic, and banking information is not included in public campaign responses.

### Verification evidence

Verification is flexible and evidence-based. A student can provide an appropriate form of evidence rather than being required to upload every possible document type.

Examples include:

- Disability or medical documentation
- University disability-support confirmation
- Student identification
- An assessment or recommendation from a qualified professional
- A supplier quotation for an assistive device or accessibility service
- Other relevant supporting evidence accepted by the administrator

An assistive-device quotation is a written price estimate from a supplier for equipment such as a wheelchair, mobility aid, prosthetic device, accessible desk, or other disability-related support. It helps administrators confirm that the requested campaign amount is reasonable.

### Privacy and document security

- New disability evidence is stored privately.
- Authorized users receive temporary document-access links instead of permanent public URLs.
- Students can access only their own verification documents.
- Donors can access only their own payment evidence.
- Administrators can review protected evidence, and sensitive document access is logged.
- Donation receipts and disbursement evidence are also stored using authenticated private delivery.

### Public campaigns

An application and a public campaign are now treated as separate stages.

An application must be approved, have valid public consent, include an appropriate public story, and be deliberately activated before donors can see it. Public campaign information is limited to the approved story, purpose, support type, target, progress, urgency, and selected beneficiary-name format.

### Administrator workflow

Administrators can:

- Review submitted applications
- Request changes or reject an application with a recorded reason
- Review private evidence
- Select and record the evidence pathway used
- Complete a disability-support verification checklist
- Approve valid applications
- Publish, pause, close, or cancel campaigns as appropriate
- Review and verify donor payment evidence

Only a super administrator can create disbursement records, upload disbursement evidence, manage the official donation account, or manage administrator access.

### Donations and disbursements

- Donations can only be recorded against approved, active campaigns.
- A donation cannot exceed the campaign's remaining target.
- Duplicate transaction references are rejected.
- A donation is added to campaign progress only after administrator verification.
- Monetary values now use fixed two-decimal precision.
- Disbursements cannot exceed verified funds raised.
- Partial disbursement does not close a campaign.
- A fully funded campaign closes after its raised funds have been fully disbursed.

### Authentication and deployment security

- Public registration is limited to students and donors.
- Administrators must use an authorized invitation.
- Production requires an explicit secret key and approved frontend address.
- Production CORS rules no longer accept arbitrary deployment origins.
- Uploads are limited to validated PDF, PNG, JPG, and JPEG files of no more than 5 MB.
- Database changes are managed through versioned migrations.

## Suggested review areas

Team members should review the system from the following perspectives:

### Public visitor

- Disability-support wording is consistent.
- Only approved campaigns appear publicly.
- Private application and verification information is never displayed.
- Anonymous and shortened beneficiary-name preferences work correctly.

### Student

- The application clearly separates private information from the public campaign story.
- Consent is required before a campaign can be published.
- Evidence requirements are understandable and flexible.
- Application and campaign statuses are clearly distinguished.

### Administrator

- Private evidence opens only through authorized temporary access.
- The verification checklist supports an appropriate evidence pathway.
- Approval is prevented until mandatory review checks are completed.
- Reasons are required when requesting changes or rejecting applications.

### Donor

- Donors see only public campaign information.
- Donations above the remaining target are rejected.
- Donors see only their own donation history and receipt evidence.
- Donor accounts cannot access administrator functions.

### Super administrator

- Disbursement controls are restricted correctly.
- Duplicate or excessive disbursements are rejected.
- Partial and complete disbursement states behave correctly.

## Testing and deployment status

- Backend regression tests passed.
- The frontend production build passed.
- The full database migration sequence passed against both an existing database copy and a fresh database.
- Role and privacy boundaries were checked through the API.
- The updated backend and database migrations are live on Render.
- Existing production accounts were retained.

Old placeholder uploads in the demo data may not open because they were never real stored documents. This does not affect new uploads, which use the updated private-storage process.

## Current source-control status

The disability-support migration is included in the repository's `main` branch. The earlier feature branch remains available as a historical review branch, but collaborators do not need to switch to it to access the completed changes.
