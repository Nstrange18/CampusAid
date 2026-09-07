"""Add disability-support and consent-aware campaign fields."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from backend.database import Base
from backend import models  # noqa: F401

revision: str = "20260904_01"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)
    inspector = sa.inspect(bind)
    request_columns = {column["name"]: column for column in inspector.get_columns("fundraising_requests")}
    checklist_columns = {column["name"]: column for column in inspector.get_columns("verification_checklists")}

    with op.batch_alter_table("fundraising_requests") as batch:
        if not request_columns["parent_or_guardian_occupation"]["nullable"]:
            batch.alter_column("parent_or_guardian_occupation", existing_type=sa.String(), nullable=True)
        if not request_columns["previous_support_received"]["nullable"]:
            batch.alter_column("previous_support_received", existing_type=sa.String(), nullable=True)
        additions = {
            "support_need_description": sa.Column("support_need_description", sa.Text(), nullable=True),
            "functional_impact": sa.Column("functional_impact", sa.Text(), nullable=True),
            "requested_support_type": sa.Column("requested_support_type", sa.String(), nullable=True),
            "public_story": sa.Column("public_story", sa.Text(), nullable=True),
            "public_display_preference": sa.Column("public_display_preference", sa.String(), nullable=False, server_default="first_name_initial"),
            "public_consent": sa.Column("public_consent", sa.Boolean(), nullable=False, server_default=sa.false()),
            "public_consent_at": sa.Column("public_consent_at", sa.DateTime(), nullable=True),
            "application_status": sa.Column("application_status", sa.String(), nullable=False, server_default="submitted"),
            "campaign_status": sa.Column("campaign_status", sa.String(), nullable=False, server_default="unpublished"),
        }
        for name, column in additions.items():
            if name not in request_columns:
                batch.add_column(column)

    with op.batch_alter_table("verification_checklists") as batch:
        additions = {
            "disability_evidence_confirmed": sa.Column("disability_evidence_confirmed", sa.Boolean(), nullable=False, server_default=sa.false()),
            "support_need_confirmed": sa.Column("support_need_confirmed", sa.Boolean(), nullable=False, server_default=sa.false()),
            "evidence_pathway": sa.Column("evidence_pathway", sa.String(), nullable=True),
        }
        for name, column in additions.items():
            if name not in checklist_columns:
                batch.add_column(column)


def downgrade() -> None:
    with op.batch_alter_table("verification_checklists") as batch:
        batch.drop_column("evidence_pathway")
        batch.drop_column("support_need_confirmed")
        batch.drop_column("disability_evidence_confirmed")

    with op.batch_alter_table("fundraising_requests") as batch:
        batch.drop_column("campaign_status")
        batch.drop_column("application_status")
        batch.drop_column("public_consent_at")
        batch.drop_column("public_consent")
        batch.drop_column("public_display_preference")
        batch.drop_column("public_story")
        batch.drop_column("requested_support_type")
        batch.drop_column("functional_impact")
        batch.drop_column("support_need_description")
        batch.alter_column("previous_support_received", existing_type=sa.String(), nullable=False)
        batch.alter_column("parent_or_guardian_occupation", existing_type=sa.String(), nullable=False)
