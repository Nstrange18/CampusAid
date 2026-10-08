# CampusAid

CampusAid is a disability-support fundraising and management platform designed to help students with physical disabilities access verified financial support for disability-related academic, mobility, medical, and accessibility needs.

The system connects students, university administrators, donors, and super administrators through a structured application, verification, fundraising, donation, and disbursement process.

## Live Application

- **Frontend:** [https://campus-aid-psi.vercel.app](https://campus-aid-psi.vercel.app)
- **Backend API:** [https://campusaid-backend-bey9.onrender.com](https://campusaid-backend-bey9.onrender.com)
- **API Documentation:** [https://campusaid-backend-bey9.onrender.com/docs](https://campusaid-backend-bey9.onrender.com/docs)

> The backend is hosted on a free Render instance and may take up to a minute to wake after a period of inactivity.

## Project Purpose

Students with physical disabilities may require mobility aids, assistive devices, rehabilitation services, accessible learning equipment, or other disability-related support.

CampusAid provides a controlled platform where:

1. A student submits a disability-support application.
2. The student provides suitable verification evidence.
3. An administrator privately reviews the application.
4. An approved application becomes a public fundraising campaign.
5. Donors contribute through the official administrator-managed donation channel.
6. Donors upload proof of payment.
7. Administrators verify the donations.
8. A super administrator records the disbursement of verified funds.

## Main Features

### Student Portal

Students can:

- Register and manage their profile
- Submit disability-support applications
- Describe the requested support and its academic impact
- Upload suitable verification evidence
- Provide a separate public campaign story
- Choose how their name appears publicly
- Give consent before campaign information is published
- Monitor application and campaign status
- Receive administrator feedback and notifications
- View previous support requests and campaigns

### Flexible Evidence Verification

Students are not required to upload every possible document type. They may provide an appropriate evidence pathway, such as:

- Student identification
- Medical or disability documentation
- University disability-support confirmation
- Recommendation from a qualified professional
- Cost estimate, invoice, or proof of expected cost
- Other relevant evidence accepted by an administrator

Sensitive evidence remains private and is available only to authorized users.

### Administrator Portal

Administrators can:

- Review submitted applications
- Access private verification evidence
- Complete a structured verification checklist
- Request changes from a student
- Approve or reject applications
- Publish, pause, close, or cancel campaigns
- Review donation records and payment evidence
- Verify or reject donations
- Manage users and monitor platform activity
- Generate administrative reports

### Super Administrator Controls

Super administrators have additional authority to:

- Invite and manage administrators
- Manage the official donation account
- Record fund disbursements
- Upload disbursement evidence
- Monitor administrative activity
- Control sensitive platform operations

### Donor Portal

Donors can:

- Register and manage their profile
- Browse approved public campaigns
- View campaign goals and fundraising progress
- Record donations
- Upload proof of payment
- Track donation-verification status
- Review their donation history

### Campaign Management

Campaigns support:

- Administrator approval before publication
- Public and private information separation
- Target amounts and verified fundraising progress
- Urgency levels
- Campaign activation and closure
- Duplicate-payment protection
- Prevention of donations above the remaining target
- Partial and complete disbursement tracking

## Privacy and Security

CampusAid handles disability-related, academic, financial, and identity information. The application therefore separates public campaign information from private application data.

### Public information may include:

- Approved campaign story
- Campaign purpose
- Requested support type
- Selected beneficiary-name format
- Target amount
- Verified amount raised
- Campaign urgency and progress

### Private information includes:

- Disability and medical evidence
- Functional-impact information
- Student contact information
- Banking or payment details
- Administrator notes
- Donation receipts
- Disbursement evidence

Additional security measures include:

- Role-based access control
- JWT authentication
- Restricted administrator registration
- Super-administrator authorization
- Protected document delivery
- Temporary authenticated file-access links
- File type and size validation
- Production CORS restrictions
- Password hashing
- Database migrations
- Audit and activity records

## User Roles

| Role | Main responsibilities |
| --- | --- |
| Student | Submit support applications, upload evidence, and monitor campaigns |
| Donor | Browse campaigns, record donations, and upload payment evidence |
| Administrator | Review applications, verify evidence, manage campaigns, and verify donations |
| Super Administrator | Manage administrators, official accounts, and fund disbursements |

## Application Workflow

```text
Student registration
        ↓
Disability-support application
        ↓
Private evidence submission
        ↓
Administrator review
        ↓
Approval and campaign publication
        ↓
Donor contribution
        ↓
Payment-proof verification
        ↓
Fund disbursement
        ↓
Campaign completion
```

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Zod
- Lucide React
- React Toastify

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- PostgreSQL
- JWT authentication
- Cloudinary private storage

### Deployment

- Vercel — frontend hosting
- Render — backend hosting
- PostgreSQL/Neon — production database
- Cloudinary — protected document storage

## Project Structure

```text
CampusAid/
├── backend/                 # FastAPI application, models and API routes
├── frontend/                # React and Vite frontend
│   ├── public/              # Public images and brand assets
│   └── src/
│       ├── api/             # API client
│       ├── components/      # Reusable interface components
│       ├── context/         # Authentication and theme state
│       ├── layouts/         # Dashboard layouts
│       └── pages/           # Application pages
├── migrations/              # Alembic database migrations
├── tests/                   # Backend regression and security tests
├── .env.example             # Example environment configuration
├── alembic.ini              # Alembic configuration
├── DEPLOYMENT.md            # Deployment instructions
└── TESTING_GUIDE.md         # Manual testing guide
```

## Local Development

### Prerequisites

Install the following before running the project:

- Python 3.11 or newer
- Node.js 20 or newer
- npm
- Git

PostgreSQL and Cloudinary are required for a production-style environment. SQLite may be used for basic local development.

### 1. Clone the repository

```bash
git clone https://github.com/Nstrange18/CampusAid.git
cd CampusAid
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update the values in `.env` as required:

```env
ENVIRONMENT=development
DATABASE_URL=sqlite:///./campusaid.db
JWT_SECRET_KEY=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

VITE_API_URL=http://localhost:8000
VITE_FRONTEND_URL=http://localhost:5173
```

Never commit real passwords, API keys, database URLs, or secret keys.

### 3. Set up the backend

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

macOS or Linux:

```bash
source .venv/bin/activate
```

Install the backend packages:

```bash
pip install -r backend/requirements.txt
```

Apply the database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn backend.main:app --reload
```

The backend will run at:

```text
http://localhost:8000
```

Interactive API documentation will be available at:

```text
http://localhost:8000/docs
```

### 4. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

## Testing

Run the backend tests from the repository root:

```bash
python -m pytest
```

Run the frontend linter:

```bash
cd frontend
npm run lint
```

Create a production frontend build:

```bash
npm run build
```

For the complete manual role and workflow checklist, see [TESTING_GUIDE.md](TESTING_GUIDE.md).

## Database Migrations

CampusAid uses Alembic for database schema management.

Check the current migration:

```bash
alembic current
```

Apply pending migrations:

```bash
alembic upgrade head
```

Create a new migration after changing the SQLAlchemy models:

```bash
alembic revision --autogenerate -m "describe the change"
```

Database migrations should be reviewed and tested before being applied to production.

## Deployment Configuration

### Backend environment variables

```env
ENVIRONMENT=production
DATABASE_URL=your-production-postgresql-url
JWT_SECRET_KEY=your-secure-random-secret
FRONTEND_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend environment variables

```env
VITE_API_URL=https://your-backend-domain.com
VITE_FRONTEND_URL=https://your-frontend-domain.com
```

The value of `FRONTEND_URL` must exactly match the deployed frontend origin for production CORS requests to work.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete deployment and migration checklist.

## Important Terminology

CampusAid uses **students with physical disabilities** in formal explanatory text.

The platform avoids poverty-based verification terminology and does not publicly disclose a student's diagnosis, medical history, private functional-impact information, or payment details.

A **cost estimate** or **invoice** refers to documentation showing the expected price of the requested equipment or service. It is not a term used to describe a person with a disability.

## Current Project Status

The application currently includes:

- Disability-support student applications
- Flexible evidence verification
- Public and private information separation
- Administrator review and approval
- Public fundraising campaigns
- Donation-proof verification
- Role-based dashboards
- Super-administrator controls
- Fund-disbursement tracking
- Protected uploads
- Responsive light and dark themes
- Production deployment

## Supporting Documentation

- [Project Update](CAMPUSAID_PROJECT_UPDATE.md)
- [Collaborator Handoff](COLLABORATOR_HANDOFF.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Testing Guide](TESTING_GUIDE.md)

## Academic Context

CampusAid was developed as a final-year academic project demonstrating the design and implementation of a secure, role-based fundraising and disability-support management system for higher-education students.

## Contributing

Collaborators should create a separate feature branch rather than working directly on `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/short-description
```

After completing and testing a change:

```bash
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Open a pull request on GitHub for review before merging.

## Disclaimer

CampusAid is an academic software project. Production use involving real medical, disability, financial, or identity information would require additional institutional approval, privacy review, security assessment, and compliance with applicable data-protection requirements.
