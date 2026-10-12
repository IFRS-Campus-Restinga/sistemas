import os
import subprocess
import sys
import django


def get_non_admin_group_permissions(permissions):
    restricted_view_codenames = {
        "view_group",
        "view_permission",
        "view_accessrequest",
        "view_password",
        "view_user",
    }
    return (
        permissions.filter(codename__startswith="view_").exclude(
            codename__in=restricted_view_codenames
        )
        | permissions.filter(
            codename__in={
                "add_additionalinfos",
                "add_personalinfos",
                "add_accountinfos",
                "change_personalinfos",
                "change_accountinfos",
            }
        )
    )


def run_command(command: list[str]):
    """Executa um comando e exibe a saída em tempo real."""
    print(f"\n👉 Rodando comando: {' '.join(command)}")
    result = subprocess.run(command)
    if result.returncode != 0:
        print(f"❌ Erro ao executar: {' '.join(command)}")
        sys.exit(result.returncode)


def ensure_initial_superuser(User, admin_group, email: str):
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": "",
            "access_profile": "servidor",
            "is_active": True,
            "is_staff": True,
            "is_superuser": True,
        },
    )

    user.access_profile = "servidor"
    user.is_active = True
    user.is_staff = True
    user.is_superuser = True
    user.groups.add(admin_group)
    user.save()

    action = "criado" if created else "atualizado"
    print(f"👤 Superusuário inicial '{email}' {action} e vinculado ao grupo 'admin'.")


def main():
    print("⚙️ Criando grupos e vinculando permissões...")

    # Configura o ambiente Django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()
    initial_user_email = os.getenv("ROOT_USER")

    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType
    from django.db import transaction

    from hub_permissions.formatter import URLFieldsParser
    from hub_users.models import User

    with transaction.atomic():
        allowed_models = {
            ("hub_users", "user"),
            ("hub_users", "password"),
            ("hub_users", "personalinfos"),
            ("hub_users", "accountinfos"),
            ("hub_users", "accessrequest"),
            ("hub_users", "bindrequest"),
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

        # Remove permissões de adicionar/alterar/excluir permissões
        try:
            permission_ct = ContentType.objects.get(app_label="auth", model="permission")
            removed_perm_count, _ = Permission.objects.filter(
                content_type=permission_ct,
                codename__in={"add_permission", "change_permission", "delete_permission"},
            ).delete()
            print(f"🧹 Removidas {removed_perm_count} permissões de gerenciamento de permissões")
        except ContentType.DoesNotExist:
            print("⚠️ ContentType 'auth.permission' não encontrado para limpeza de permissões")

        # Remove somente permissões de exclusão indevidas do model de permissões do Django,
        # preservando permissões de exclusão do domínio (ex.: delete_curriculum)
        permission_ct = ContentType.objects.get(app_label="auth", model="permission")
        removed_delete_count, _ = Permission.objects.filter(
            content_type=permission_ct,
            codename__in={"delete_permission"},
        ).delete()
        print(f"🧹 Removidas {removed_delete_count} permissões de exclusão do sistema de permissões")

        # --- Criação dos grupos ---
        grupos = ["admin", "coord", "user"]
        for nome_grupo in grupos:
            grupo, created = Group.objects.get_or_create(name=nome_grupo)
            if created:
                print(f"✅ Grupo '{nome_grupo}' criado.")
            else:
                print(f"ℹ️ Grupo '{nome_grupo}' já existia.")

        # --- Permissões ---
        for permission in Permission.objects.all():
            normalized_name = URLFieldsParser.normalize_permission_name(permission.name)
            if permission.name != normalized_name and normalized_name:
                permission.name = normalized_name
                permission.save(update_fields=["name"])
                print(f"🛠️ Permissão '{permission.codename}' teve nome normalizado para '{normalized_name}'.")

            if not permission.name:
                inferred_name = f"Can {permission.codename.replace('_', ' ')}"
                permission.name = inferred_name
                permission.save(update_fields=["name"])
                print(f"🛠️ Permissão '{permission.codename}' teve nome restaurado para '{inferred_name}'.")

        todas_permissoes = Permission.objects.all()
        permissoes_grupo = get_non_admin_group_permissions(todas_permissoes)

        # Admin recebe todas as permissões
        admin_group = Group.objects.get(name="admin")
        admin_group.permissions.set(todas_permissoes)
        admin_group.save()
        print(f"🔐 Grupo 'admin' recebeu {todas_permissoes.count()} permissões.")

        # User recebe permissões de visualização permitidas e pode alterar suas informações.
        user_group = Group.objects.get(name="user")
        user_group.permissions.set(permissoes_grupo)
        user_group.save()
        user_group.permissions.remove(
            Permission.objects.filter(codename='delete_curriculum').first()
        )
        print(
            f"👁️ Grupo 'user' recebeu {permissoes_grupo.count()} permissões "
            "(visualização permitida e alteração de informações pessoais/da conta)."
        )

        # Coord recebe as mesmas permissões permitidas para o grupo user.
        coord_group = Group.objects.get(name="coord")
        coord_group.permissions.set(permissoes_grupo)
        coord_group.save()
        coord_group.permissions.remove(
            Permission.objects.filter(codename='delete_curriculum').first()
        )
        print(
            f"🧭 Grupo 'coord' recebeu {permissoes_grupo.count()} permissões "
            "sem as visualizações restritas."
        )

        # --- Garantir superusuário inicial ---
        try:
            if initial_user_email:
                ensure_initial_superuser(User, admin_group, initial_user_email)
            else:
                user = User.objects.first()
                if user:
                    user.access_profile = 'servidor'
                    user.is_active = True
                    user.groups.add(admin_group)
                    user.save()
                    print(f"👤 Usuário '{user.username}' vinculado ao grupo 'admin'.")
                else:
                    print("⚠️ Nenhum usuário encontrado no banco de dados.")
        except Exception as e:
            print(f"❌ Erro ao vincular usuário: {e}")

    # --- Mapeamento de UUIDs de grupos e permissões ---
    run_command([sys.executable, "manage.py", "map_groups_and_permissions"])

    # --- Subir servidor ASGI compatível com async/await ---
    runserver_host = os.getenv("RUNSERVER_HOST", "127.0.0.1")
    runserver_port = os.getenv("RUNSERVER_PORT", "8000")
    runserver_reload = os.getenv("RUNSERVER_RELOAD", "false").lower() in {"1", "true", "yes"}

    print(f"🌍 Subindo servidor ASGI em {runserver_host}:{runserver_port} ...")
    uvicorn_command = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.asgi:application",
        "--host",
        runserver_host,
        "--port",
        runserver_port,
    ]
    if runserver_reload:
        uvicorn_command.append("--reload")

    run_command(uvicorn_command)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Execução interrompida pelo usuário.")
