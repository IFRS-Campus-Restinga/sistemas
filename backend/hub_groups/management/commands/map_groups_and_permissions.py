from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from hub_groups.models import GroupUUIDMap
from hub_permissions.models import PermissionUUIDMap


class Command(BaseCommand):
    help = "Mapeia todos os grupos e permissões com UUIDs"

    def handle(self, *args, **kwargs):
        self.stdout.write("📌 Iniciando mapeamento de grupos e permissões...")

        permissoes = Permission.objects.all()
        self.stdout.write(f"🔐 Total de permissões: {permissoes.count()}")

        for grupo in Group.objects.all():
            uuid_map, criado = GroupUUIDMap.objects.get_or_create(group=grupo)
            status = "🆕" if criado else "🔁"
            self.stdout.write(f"{status} Grupo '{grupo.name}' UUID: {uuid_map.uuid}")

        for perm in permissoes:
            uuid_map, criado = PermissionUUIDMap.objects.get_or_create(permission=perm)
            status = "🆕" if criado else "🔁"
            self.stdout.write(f"{status} Permissão '{perm.codename}' UUID: {uuid_map.uuid}")

        self.stdout.write("✅ Mapeamento concluído com sucesso.")
