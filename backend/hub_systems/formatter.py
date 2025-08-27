from hub_systems.models import System

class FormatSystemData:
    @staticmethod
    def list_format(instance: System):
        return {
            'id': instance.id,
            'name': instance.name,
            'system_url': instance.system_url,
            'is_active': instance.is_active,
            'dev_team': [dev.id for dev in instance.dev_team.all()]
        }
    
    @staticmethod
    def details_format(instance: System):
        return {
            'system': {
                'id': instance.id,
                'name': instance.name,
                'secret_key': instance.secret_key,
                'current_state': instance.current_state,
                'system_url': instance.system_url,
                'is_active': instance.is_active,
                'dev_team': [dev.id for dev in instance.dev_team.all()],
                'groups': [group.name for group in instance.groups.all()]
            },
            'dev_team': [f'{dev.first_name} {dev.last_name}' for dev in instance.dev_team.all()]
        }