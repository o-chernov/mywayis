"""add rate limit counters

Revision ID: c3e8a1f6b402
Revises: b7f2c9a4e1d8
Create Date: 2026-08-18 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3e8a1f6b402'
down_revision: Union[str, Sequence[str], None] = 'b7f2c9a4e1d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "rate_limit_counters",
        sa.Column("key_hash", sa.String(length=64), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column(
            "window_started_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("key_hash", name="pk_rate_limit_counters"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("rate_limit_counters")
