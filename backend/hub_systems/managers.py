import uuid
from django.db import models
from hub_users.models import CustomUser

class SystemManager(models.Manager):
    def list_all(self, user_id: str):
        user = CustomUser.objects.get(id=uuid.UUID(user_id))

        user_groups = [group.name for group in user.groups.all()]

        if 'admin' in user_groups:
            return self.get_queryset().all()
                
    def list_menu(self, user_id: str):
        user = CustomUser.objects.get(id=uuid.UUID(user_id))
        user_groups = [group.name for group in user.groups.all()]

        systems = self.get_queryset().filter(is_active=True)
        results = []

        is_admin = 'admin' in user_groups

        for system in systems:
            system_groups = [group.name for group in system.groups.all()]

            if (system.dev_team.filter(id=user.id).exists() and system.current_state == 'Em desenvolvimento' and system.is_active == True) or is_admin:
                results.append(system)
            elif set(user_groups) & set(system_groups):
                results.append(system)

        return results