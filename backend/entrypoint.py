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
    from hub_users.models import CustomUser
    from hub_groups.models import GroupUUIDMap
    from hub_permissions.models import PermissionUUIDMap
    from django.db import transaction

    with transaction.atomic():
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

        # Coord e User recebem apenas as permissões de visualização
        for nome in ["coord", "user"]:
            grupo = Group.objects.get(name=nome)
            grupo.permissions.clear()  # limpa antes
            for perm in permissoes_view:
                grupo.permissions.add(perm)
            grupo.save()
            print(f"👁️ Grupo '{nome}' recebeu {permissoes_view.count()} permissões (apenas view_).")

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
        print("📊 Mapeando UUIDs de grupos e permissões...")

        for grupo in Group.objects.all():
            uuid_map, criado = GroupUUIDMap.objects.get_or_create(group=grupo)
            status = "🆕" if criado else "🔁"
            print(f"{status} Grupo '{grupo.name}' UUID: {uuid_map.uuid}")

        for perm in todas_permissoes:
            uuid_map, criado = PermissionUUIDMap.objects.get_or_create(permission=perm)
            status = "🆕" if criado else "🔁"
            print(f"{status} Permissão '{perm.codename}' UUID: {uuid_map.uuid}")

        print("✅ Mapeamento de UUIDs concluído.")

    # --- Subir servidor Django ---
    print("🌍 Subindo servidor Django em 127.0.0.1:8000 ...")
    run_command([sys.executable, "manage.py", "runserver", "127.0.0.1:8000"])


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Execução interrompida pelo usuário.")
