# CampusAid deployment checklist

This branch changes the application domain and database schema. Deploy it first to a staging environment that uses a copy of production data.

## Required configuration

Backend:

- `ENVIRONMENT=production`
- `DATABASE_URL` set to the production PostgreSQL connection string
- `JWT_SECRET_KEY` set to a long, randomly generated secret
- `FRONTEND_URL` set to the exact deployed frontend origin, without a trailing slash
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`

Frontend:

- `VITE_API_URL` set to the deployed backend origin
- `VITE_FRONTEND_URL` set to the deployed frontend origin

Do not copy real secrets into `.env.example`, source control, frontend variables, or build logs.

## Database rollout

1. Stop administrative approvals, donation verification, and disbursement writes for the migration window.
2. Take and verify a restorable database backup.
3. Install the backend requirements.
4. Run `alembic current` and record the result.
5. Run `alembic upgrade head` from the repository root.
6. Confirm the current revision is `20260906_05`.
7. Start the new backend and then deploy the frontend.

The application no longer creates tables automatically at startup. A failed or skipped Alembic migration must therefore fail the deployment rather than silently producing a partial schema.

## Staging checks

- Register one student and one donor; confirm public registration cannot create an administrator.
- Submit a disability-support application with public consent and one valid evidence pathway.
- Confirm a donor cannot see the application before approval.
- As an administrator, review evidence using the temporary authenticated link and record the checklist pathway.
- Approve and publish the campaign; confirm the public response contains only the public story and selected display name.
- Upload and verify a donation proof, and confirm the amount cannot exceed the remaining target.
- Confirm only a super administrator can create a disbursement or upload disbursement evidence.
- Test partial and full disbursements and verify that only full disbursement closes the campaign.
- Verify suspended accounts and revoked refresh tokens cannot continue authenticated activity.

## Legacy-file warning

New disability evidence is stored as authenticated Cloudinary content and accessed through short-lived authorized links. Existing `file_path` records were not automatically re-uploaded. Inventory and migrate those legacy objects before treating them as private; removing the old database URL alone does not make an already-public provider object private.

New donation proofs and disbursement evidence use authenticated delivery. Existing records in the legacy URL fields must still be inventoried and re-uploaded before they can be considered private at the storage-provider level.

## Rollback

Prefer rolling the application back while retaining the expanded database schema; the new columns are additive through the current revisions. Do not run Alembic downgrades against production without a tested backup restore, because downgrade paths can discard disability-support and privacy metadata created after deployment.
