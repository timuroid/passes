"""Allow application settings to store short configurable texts."""

from alembic import op
import sqlalchemy as sa


revision = "0005_expand_settings"
down_revision = "0004_app_settings"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "app_settings",
        "value",
        existing_type=sa.String(length=64),
        type_=sa.Text(),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "app_settings",
        "value",
        existing_type=sa.Text(),
        type_=sa.String(length=64),
        existing_nullable=False,
    )
