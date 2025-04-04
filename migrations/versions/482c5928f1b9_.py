"""empty message

Revision ID: 482c5928f1b9
Revises: 0763d677d453
Create Date: 2025-04-01 15:08:54.063029

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '482c5928f1b9'
down_revision = '0763d677d453'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('admins',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=50), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('rol', sa.Enum('Admin', name='role_admin'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username')
    )
    op.create_table('negocio',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre_negocio', sa.String(length=50), nullable=False),
    sa.Column('negocio_cif', sa.String(length=15), nullable=False),
    sa.Column('negocio_cp', sa.String(length=10), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('negocio_cif'),
    sa.UniqueConstraint('nombre_negocio')
    )
    op.create_table('servicio',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('negocio_id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=75), nullable=False),
    sa.Column('descripcion', sa.String(length=500), nullable=False),
    sa.Column('precio', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.ForeignKeyConstraint(['negocio_id'], ['negocio.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('usuarios',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=50), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('negocio_id', sa.Integer(), nullable=False),
    sa.Column('rol', sa.Enum('master', 'jefe', 'usuario', name='role_enum'), nullable=False),
    sa.ForeignKeyConstraint(['negocio_id'], ['negocio.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username')
    )
    op.create_table('clientes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=75), nullable=False),
    sa.Column('direccion', sa.String(length=255), nullable=True),
    sa.Column('telefono', sa.String(length=15), nullable=False),
    sa.Column('cliente_dni', sa.String(length=20), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('servicio_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['servicio_id'], ['servicio.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('cliente_dni'),
    sa.UniqueConstraint('email')
    )
    op.create_table('citas',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.Column('cliente_id', sa.Integer(), nullable=False),
    sa.Column('servicio_id', sa.Integer(), nullable=False),
    sa.Column('estado', sa.Enum('pendiente', 'confirmada', 'cancelada', 'realizada', name='estado_cita'), nullable=False),
    sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
    sa.ForeignKeyConstraint(['servicio_id'], ['servicio.id'], ),
    sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('nota',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cliente_id', sa.Integer(), nullable=False),
    sa.Column('descripcion', sa.String(length=500), nullable=False),
    sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('pagos',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cliente_id', sa.Integer(), nullable=False),
    sa.Column('metodo_pago', sa.Enum('efectivo', 'tarjeta', name='metodo_pago_enum'), nullable=False),
    sa.Column('total_estimado', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('pagos_realizados', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('fecha_pago', sa.Date(), nullable=True),
    sa.Column('estado', sa.Enum('pendiente', 'pagado', name='estado_enum'), nullable=False),
    sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('calendario',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('dia', sa.Date(), nullable=False),
    sa.Column('cita_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['cita_id'], ['citas.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('cita_id')
    )
    op.create_table('historial_de_servicio',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cliente_id', sa.Integer(), nullable=False),
    sa.Column('cita_id', sa.Integer(), nullable=False),
    sa.Column('nota_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['cita_id'], ['citas.id'], ),
    sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ),
    sa.ForeignKeyConstraint(['nota_id'], ['nota.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('problemas',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.Column('descripcion', sa.String(length=500), nullable=False),
    sa.Column('dia_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['dia_id'], ['calendario.id'], ),
    sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('user')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('email', sa.VARCHAR(length=120), autoincrement=False, nullable=False),
    sa.Column('password', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('is_active', sa.BOOLEAN(), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='user_pkey'),
    sa.UniqueConstraint('email', name='user_email_key')
    )
    op.drop_table('problemas')
    op.drop_table('historial_de_servicio')
    op.drop_table('calendario')
    op.drop_table('pagos')
    op.drop_table('nota')
    op.drop_table('citas')
    op.drop_table('clientes')
    op.drop_table('usuarios')
    op.drop_table('servicio')
    op.drop_table('negocio')
    op.drop_table('admins')
    # ### end Alembic commands ###
