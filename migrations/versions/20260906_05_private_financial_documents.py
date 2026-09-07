"""Store payment evidence as authenticated private assets."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260906_05"
down_revision: Union[str, None] = "20260906_04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    donation_columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("donation_records")}
    with op.batch_alter_table("donation_records") as batch:
        for name, column_type in (
            ("proof_storage_key", sa.String()),
            ("proof_storage_resource_type", sa.String()),
            ("proof_storage_format", sa.String()),
            ("proof_storage_version", sa.Integer()),
        ):
            if name not in donation_columns:
                batch.add_column(sa.Column(name, column_type, nullable=True))

    disbursement_columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("disbursements")}
    with op.batch_alter_table("disbursements") as batch:
        for name, column_type in (
            ("evidence_storage_key", sa.String()),
            ("evidence_storage_resource_type", sa.String()),
            ("evidence_storage_format", sa.String()),
            ("evidence_storage_version", sa.Integer()),
        ):
            if name not in disbursement_columns:
                batch.add_column(sa.Column(name, column_type, nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("disbursements") as batch:
        batch.drop_column("evidence_storage_version")
        batch.drop_column("evidence_storage_format")
        batch.drop_column("evidence_storage_resource_type")
        batch.drop_column("evidence_storage_key")
    with op.batch_alter_table("donation_records") as batch:
        batch.drop_column("proof_storage_version")
        batch.drop_column("proof_storage_format")
        batch.drop_column("proof_storage_resource_type")
        batch.drop_column("proof_storage_key")
