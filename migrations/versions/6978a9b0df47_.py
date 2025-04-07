"""empty message

Revision ID: 6978a9b0df47
Revises: 3c296f23037f
Create Date: 2025-04-07 09:25:02.259086

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6978a9b0df47'
down_revision = '3c296f23037f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('problemas')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('problemas',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('usuario_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('descripcion', sa.VARCHAR(length=500), autoincrement=False, nullable=False),
    sa.Column('dia_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['dia_id'], ['calendario.id'], name='problemas_dia_id_fkey'),
    sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], name='problemas_usuario_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='problemas_pkey')
    )
    # ### end Alembic commands ###
