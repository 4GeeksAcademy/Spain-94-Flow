"""empty message

Revision ID: 73d9c96b6f34
Revises: 53b48df1b7bd
Create Date: 2025-04-09 10:42:26.667834

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '73d9c96b6f34'
down_revision = '53b48df1b7bd'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('cliente_servicio',
    sa.Column('cliente_id', sa.Integer(), nullable=False),
    sa.Column('servicio_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
    sa.ForeignKeyConstraint(['servicio_id'], ['servicio.id'], ),
    sa.PrimaryKeyConstraint('cliente_id', 'servicio_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('cliente_servicio')
    # ### end Alembic commands ###
