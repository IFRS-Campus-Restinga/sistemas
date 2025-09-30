set -e

echo "📦 Instalando dependências do backend..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🚀 Rodando makemigrations de todos os apps..."
python manage.py makemigrations --noinput

echo "🚀 Aplicando migrate..."
python manage.py migrate --noinput

echo "⚙️ Criando grupo admin e vinculando permissões..."
python manage.py shell <<EOF
from django.contrib.auth.models import Group, Permission
from django.db import transaction

with transaction.atomic():
    admin_group, created = Group.objects.get_or_create(name="admin")
    if created:
        print("Grupo 'admin' criado")
    else:
        print("Grupo 'admin' já existia")

    perms = Permission.objects.all()
    admin_group.permissions.set(perms)
    admin_group.save()
    print(f"✅ Vinculadas {perms.count()} permissões ao grupo admin")
EOF

echo "📊 Rodando script de mapeamento UUID..."
python manage.py map_groups_and_permissions

echo "🌍 Subindo servidor Django..."
gunicorn backend.wsgi:application --bind 0.0.0.0:\$PORT --workers 4
