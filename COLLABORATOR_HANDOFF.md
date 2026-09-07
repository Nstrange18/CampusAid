# CampusAid disability-support migration — collaborator handoff

## Purpose

CampusAid is being updated from a fundraising system focused on indigent students to a disability-support fundraising system for students with physical disabilities.

The work is currently on:

`feature/disability-support-migration`

It should be reviewed and tested on this branch before it is merged into `main` or deployed to production.

## Important deployment note

Pushing the feature branch to GitHub does not necessarily update Render. Render deploys whichever Git branch is selected in the service's dashboard settings.

- If Render is configured for `main`, pushing this feature branch will not change production.
- If Render is configured for this feature branch and automatic deployments are enabled, pushing it can trigger a deployment.
- Before pushing, confirm the configured branch under the Render service's **Settings → Build & Deploy** section.

The repository does not currently contain a `render.yaml`, so the active Render branch and deployment commands must be checked in the Render dashboard.

## How to download and test the branch

These instructions assume the collaborator already cloned the repository.

### 1. Protect any unfinished local work

Run:

```bash
git status
```

If files are modified, commit or stash them before changing branches. Do not discard existing work.

### 2. Fetch the branch from GitHub

```bash
git fetch origin
git switch --track origin/feature/disability-support-migration
```

If the local branch already exists:

```bash
git switch feature/disability-support-migration
git pull --ff-only origin feature/disability-support-migration
```

Confirm the active branch:

```bash
git branch --show-current
```

The result should be `feature/disability-support-migration`.

## Local setup

### Backend

Create a private `.env` file using `.env.example` as a guide. Do not commit real credentials.

Required values include:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Install backend requirements and migrate the selected local/test database:

```bash
pip install -r backend/requirements.txt
alembic upgrade head
```

Do not point `DATABASE_URL` at the production database for ordinary local testing.

Start the backend:

```bash
python -m uvicorn backend.main:app --reload
```

### Frontend

Set the frontend API URL to the local backend:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

Use the URL printed by Vite. Check the browser Network or Console panel if requests unexpectedly go to the deployed Render backend.

## What changed

- Replaced poverty-focused language with disability-support terminology.
- Separated private application data from the public campaign story.
- Added explicit public-display preference and consent.
- Added disability-related support need, functional impact, and requested support type.
- Added flexible evidence-pathway verification; administrators should accept an appropriate pathway rather than require every document type.
- Added separate application and public campaign lifecycle statuses.
- Restricted public campaign responses to approved public information.
- Added authenticated private storage and temporary access links for disability evidence, donation receipts, and disbursement evidence.
- Added administrator access logging for sensitive documents.
- Restricted disbursement writes to super administrators.
- Added fixed-precision financial fields, overfunding protection, duplicate-reference checks, and transaction locking during verification.
- Restricted public registration to student and donor accounts.
- Added stronger production environment and CORS requirements.
- Added Alembic migrations and regression tests.

## Review checklist

### Public visitor

- Confirm disability-support wording is used.
- Confirm only approved and active campaigns are visible.
- Confirm medical evidence, functional-impact details, bank details, student identifiers, and administrator notes are absent.
- Confirm anonymous and shortened beneficiary-name preferences work.

### Student

- Submit an application with private background, support need, functional impact, public story, display preference, and consent.
- Confirm missing consent is rejected.
- Confirm invalid or disguised files are rejected.
- Confirm an appropriate evidence pathway is sufficient.
- Confirm the student can access only their own documents and applications.

### Administrator

- Review private evidence using a temporary authorized link.
- Complete the disability-support checklist.
- Confirm incomplete review data prevents approval.
- Test changes requested, rejection with a reason, approval, and campaign publication.
- Confirm sensitive-document access is logged.

### Donor

- Confirm only active approved campaigns can receive donations.
- Confirm donations above the remaining target are rejected.
- Upload a throwaway receipt and verify that the API/UI does not expose a permanent provider URL.
- Confirm a donor sees only their own donation records and a safe campaign summary.
- Confirm donor accounts cannot access administrator routes.

### Disbursement

- Confirm only a super administrator can create a disbursement or upload evidence.
- Confirm duplicate payment references and amounts above the available balance are rejected.
- Confirm a partial disbursement does not close a campaign.
- Confirm a fully funded campaign closes after the full raised amount is disbursed.

The detailed manual checklist is also available in `TESTING_GUIDE.md`.

## Automated verification already completed

- Nine backend regression tests passed.
- The frontend production build passed.
- Frontend lint completed with non-blocking warnings.
- Python syntax checks passed.
- The complete migration chain reached revision `20260906_05` on a fresh database and a disposable copy of the previous database.
- Direct API checks passed for student, donor, administrator, privacy, and authorization boundaries.

Collaborators should rerun:

```bash
python -m unittest discover -s tests -v
cd frontend
npm run lint
npm run build
```

## Production deployment sequence

Do not deploy until the feature branch has been reviewed and the production database has a verified backup.

1. Open a pull request from `feature/disability-support-migration` into `main`.
2. Review the code and migration files.
3. Test against a staging copy of production data.
4. Back up the production database and verify that the backup can be restored.
5. Merge the approved pull request into `main`.
6. Deploy the backend with the updated requirements and environment variables.
7. Run `alembic upgrade head` against the production database.
8. Confirm the database revision is `20260906_05`.
9. Deploy/rebuild the frontend with the production `VITE_API_URL`.
10. Perform the public, student, administrator, donor, and disbursement smoke checks.

Existing user accounts are retained by the migrations. The migrations do not delete the `users` table.

## Known review notes

- Old demo upload URLs may point to placeholder files. They can be ignored or removed because they are not real user evidence.
- New sensitive uploads use authenticated private delivery.
- The frontend production bundle currently emits a non-blocking large-chunk warning.

## Git and deployment safety

- Do not commit `.env` files, database files, tokens, or Cloudinary credentials.
- Do not commit the `.codex-test` review database.
- Do not push directly to `main` unless the team explicitly agrees.
- Do not run production migrations without a recent verified backup.
- Do not downgrade the production schema without testing the downgrade against a database copy, because downgrade operations can remove newly collected disability-support metadata.
