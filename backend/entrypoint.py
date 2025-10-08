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
    print("⚙️ Criando grupo admin e vinculando ao usuário existente...")

    # Configura o ambiente Django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()

    from django.contrib.auth.models import Group, Permission, User
    from django.db import transaction

    with transaction.atomic():
        # Cria (ou obtém) o grupo admin
        admin_group, created = Group.objects.get_or_create(name="admin")
        if created:
            print("Grupo 'admin' criado.")
        else:
            print("Grupo 'admin' já existia.")

        # Atribui todas as permissões
        perms = Permission.objects.all()
        admin_group.permissions.set(perms)
        admin_group.save()
        print(f"✅ Vinculadas {perms.count()} permissões ao grupo admin.")

        # Vincula o grupo a um usuário existente
        try:
            user = User.objects.first()  # pega o primeiro usuário existente
            if user:
                user.groups.add(admin_group)
                user.save()
                print(f"👤 Usuário '{user.username}' vinculado ao grupo admin.")
            else:
                print("⚠️ Nenhum usuário encontrado no banco de dados.")
        except Exception as e:
            print(f"❌ Erro ao vincular usuário: {e}")

    print("📊 Rodando script de mapeamento UUID...")
    run_command([sys.executable, "manage.py", "map_groups_and_permissions"])

    print("🌍 Subindo servidor Django em 127.0.0.1:8000 ...")
    run_command([sys.executable, "manage.py", "runserver", "127.0.0.1:8000"])


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Execução interrompida pelo usuário.")
