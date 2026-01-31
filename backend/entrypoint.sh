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
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

with transaction.atomic():
    allowed_models = {
        ("hub_users", "customuser"),
        ("hub_users", "password"),
        ("hub_users", "additionalinfos"),
        ("hub_systems", "system"),
        ("auth", "group"),
        ("auth", "permission"),
        ("hub_calendars", "calendar"),
        ("hub_calendars", "event"),
        ("hub_academic", "courseclass"),
        ("hub_academic", "course"),
        ("hub_academic", "ppc"),
        ("hub_academic", "curriculum"),
        ("hub_academic", "subject"),
    }

    allowed_apps = {app for app, _ in allowed_models}
    allowed_model_names = {model for _, model in allowed_models}

    allowed_ct_ids = set(
        ContentType.objects.filter(
            app_label__in=allowed_apps,
            model__in=allowed_model_names,
        ).values_list("id", flat=True)
    )

    removed_count, _ = Permission.objects.exclude(content_type_id__in=allowed_ct_ids).delete()
    print(f"🧹 Removidas {removed_count} permissões de models não permitidos")

    try:
        permission_ct = ContentType.objects.get(app_label="auth", model="permission")
        removed_perm_count, _ = Permission.objects.filter(
            content_type=permission_ct,
            codename__in={"add_permission", "change_permission", "delete_permission"},
        ).delete()
        print(f"🧹 Removidas {removed_perm_count} permissões de gerenciamento de permissões")
    except ContentType.DoesNotExist:
        print("⚠️ ContentType 'auth.permission' não encontrado para limpeza de permissões")

    removed_delete_count, _ = Permission.objects.filter(
        codename__startswith="delete_"
    ).delete()
    print(f"🧹 Removidas {removed_delete_count} permissões de exclusão")

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

echo "🌍 Subindo servidor Django..."
gunicorn backend.wsgi:application --bind 0.0.0.0:\$PORT --workers 4
