"""Store verification documents as authenticated provider assets."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260904_02"
down_revision: Union[str, None] = "20260904_01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"]: column for column in inspector.get_columns("verification_documents")}
    with op.batch_alter_table("verification_documents") as batch:
        if not columns["file_path"]["nullable"]:
            batch.alter_column("file_path", existing_type=sa.String(), nullable=True)
        additions = {
            "storage_key": sa.Column("storage_key", sa.String(), nullable=True),
            "storage_resource_type": sa.Column("storage_resource_type", sa.String(), nullable=True),
            "storage_format": sa.Column("storage_format", sa.String(), nullable=True),
            "storage_version": sa.Column("storage_version", sa.Integer(), nullable=True),
        }
        for name, column in additions.items():
            if name not in columns:
                batch.add_column(column)


def downgrade() -> None:
    with op.batch_alter_table("verification_documents") as batch:
        batch.drop_column("storage_version")
        batch.drop_column("storage_format")
        batch.drop_column("storage_resource_type")
        batch.drop_column("storage_key")
        batch.alter_column("file_path", existing_type=sa.String(), nullable=False)
