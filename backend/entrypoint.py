import os
import subprocess
import sys
import django

def run_command(command: list[str]):
    """Executa um comando e exibe a saída em tempo real."""
    print(f"\n👉 Rodando comando: {' '.join(command)}")
    result = subprocess.run(command)
    if result.returncode != 0:
        print(f"❌ Erro ao executar: {' '.join(command)}")
        sys.exit(result.returncode)

def main():
    print("⚙️ Criando grupos e vinculando permissões...")

    # Configura o ambiente Django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()

    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType
    from hub_users.models import CustomUser
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

        # Remove todas as permissões de exclusão
        removed_delete_count, _ = Permission.objects.filter(
            codename__startswith="delete_"
        ).delete()
        print(f"🧹 Removidas {removed_delete_count} permissões de exclusão")

        # --- Criação dos grupos ---
        grupos = ["admin", "coord", "user"]
        for nome_grupo in grupos:
            grupo, created = Group.objects.get_or_create(name=nome_grupo)
            if created:
                print(f"✅ Grupo '{nome_grupo}' criado.")
            else:
                print(f"ℹ️ Grupo '{nome_grupo}' já existia.")

        # --- Permissões ---
        todas_permissoes = Permission.objects.all()
        permissoes_view = todas_permissoes.filter(
            codename__startswith="view_"
        ) | todas_permissoes.filter(
            codename="add_additionalinfos"
        )

        # Admin recebe todas as permissões
        admin_group = Group.objects.get(name="admin")
        admin_group.permissions.set(todas_permissoes)
        admin_group.save()
        print(f"🔐 Grupo 'admin' recebeu {todas_permissoes.count()} permissões.")

        # User recebe apenas as permissões de visualização
        user_group = Group.objects.get(name="user")
        user_group.permissions.set(permissoes_view)
        user_group.save()
        print(f"👁️ Grupo 'user' recebeu {permissoes_view.count()} permissões (apenas view_).")

        # --- Vincular usuário existente ao grupo admin ---
        try:
            user = CustomUser.objects.first()  # pega o primeiro usuário existente
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

    # --- Subir servidor Django ---
    print("🌍 Subindo servidor Django em 127.0.0.1:8000 ...")
    run_command([sys.executable, "manage.py", "runserver", "127.0.0.1:8000"])


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Execução interrompida pelo usuário.")
