"""Use fixed-precision currency and retain donation rejection reasons."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260906_04"
down_revision: Union[str, None] = "20260905_03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("fundraising_requests") as batch:
        batch.alter_column("amount_needed", existing_type=sa.Float(), type_=sa.Numeric(12, 2), existing_nullable=False)
        batch.alter_column("amount_raised", existing_type=sa.Float(), type_=sa.Numeric(12, 2), existing_nullable=True)

    donation_columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("donation_records")}
    with op.batch_alter_table("donation_records") as batch:
        batch.alter_column("amount", existing_type=sa.Float(), type_=sa.Numeric(12, 2), existing_nullable=False)
        if "rejection_reason" not in donation_columns:
            batch.add_column(sa.Column("rejection_reason", sa.Text(), nullable=True))

    with op.batch_alter_table("disbursements") as batch:
        batch.alter_column("amount_disbursed", existing_type=sa.Float(), type_=sa.Numeric(12, 2), existing_nullable=False)
        batch.create_index("ix_disbursements_payment_reference", ["payment_reference"], unique=False)


def downgrade() -> None:
    with op.batch_alter_table("disbursements") as batch:
        batch.drop_index("ix_disbursements_payment_reference")
        batch.alter_column("amount_disbursed", existing_type=sa.Numeric(12, 2), type_=sa.Float(), existing_nullable=False)
    with op.batch_alter_table("donation_records") as batch:
        batch.drop_column("rejection_reason")
        batch.alter_column("amount", existing_type=sa.Numeric(12, 2), type_=sa.Float(), existing_nullable=False)
    with op.batch_alter_table("fundraising_requests") as batch:
        batch.alter_column("amount_raised", existing_type=sa.Numeric(12, 2), type_=sa.Float(), existing_nullable=True)
        batch.alter_column("amount_needed", existing_type=sa.Numeric(12, 2), type_=sa.Float(), existing_nullable=False)
