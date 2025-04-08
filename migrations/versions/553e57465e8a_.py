"""empty message

Revision ID: 553e57465e8a
Revises: 34bb5ed7ff21
Create Date: 2025-04-08 14:34:13.649968

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '553e57465e8a'
down_revision = '34bb5ed7ff21'
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
    with op.batch_alter_table('clientes', schema=None) as batch_op:
        batch_op.drop_constraint('clientes_servicio_id_fkey', type_='foreignkey')
        batch_op.drop_column('servicio_id')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('clientes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('servicio_id', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.create_foreign_key('clientes_servicio_id_fkey', 'servicio', ['servicio_id'], ['id'])

    op.drop_table('cliente_servicio')
    # ### end Alembic commands ###
