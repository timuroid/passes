"""Add optional driver phone number to pass requests."""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_pass_phone_number"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("pass_requests", sa.Column("phone_number", sa.String(length=16), nullable=True))


def downgrade() -> None:
    op.drop_column("pass_requests", "phone_number")
