"""Add normalized vehicle-number search key."""

from alembic import op
import sqlalchemy as sa


revision = "0003_vehicle_search_key"
down_revision = "0002_add_pass_phone_number"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("pass_requests", sa.Column("vehicle_number_search", sa.String(length=24), nullable=True))
    op.execute(
        """
        UPDATE pass_requests
        SET vehicle_number_search = translate(
            upper(regexp_replace(vehicle_number, '[[:space:]-]+', '', 'g')),
            'АВЕКМНОРСТУХ',
            'ABEKMHOPCTYX'
        )
        """
    )
    op.alter_column("pass_requests", "vehicle_number_search", nullable=False)
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        """
        CREATE INDEX ix_pass_requests_vehicle_number_search_trgm
        ON pass_requests USING gin (vehicle_number_search gin_trgm_ops)
        """
    )


def downgrade() -> None:
    op.drop_index("ix_pass_requests_vehicle_number_search_trgm", table_name="pass_requests")
    op.drop_column("pass_requests", "vehicle_number_search")
