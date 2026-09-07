"""Backfill separate application and campaign lifecycle states."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260905_03"
down_revision: Union[str, None] = "20260904_02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    requests = sa.table(
        "fundraising_requests",
        sa.column("status", sa.String()),
        sa.column("application_status", sa.String()),
        sa.column("campaign_status", sa.String()),
    )
    op.execute(requests.update().where(requests.c.status == "pending").values(application_status="submitted", campaign_status="unpublished"))
    op.execute(requests.update().where(requests.c.status == "approved").values(application_status="approved", campaign_status="active"))
    op.execute(requests.update().where(requests.c.status == "rejected").values(application_status="rejected", campaign_status="unpublished"))
    op.execute(requests.update().where(requests.c.status == "completed").values(application_status="approved", campaign_status="funded"))


def downgrade() -> None:
    # The legacy status mirror remains populated, so no destructive backfill is needed.
    pass
