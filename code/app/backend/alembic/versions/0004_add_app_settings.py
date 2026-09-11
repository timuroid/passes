"""Add persistent application settings."""

from alembic import op
import sqlalchemy as sa


revision = "0004_app_settings"
down_revision = "0003_vehicle_search_key"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "app_settings",
        sa.Column("key", sa.String(length=64), primary_key=True),
        sa.Column("value", sa.String(length=64), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("app_settings")
