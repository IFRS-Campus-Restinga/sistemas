from django.contrib.auth.models import Group

class FormatGroupData:
    @staticmethod
    def list_format(instance: Group):
        formatted_name = instance.name.replace('_', ' ').title()

        return {
            'id': instance.uuid_map.uuid,
            'Nome': formatted_name,
        }
    
    @staticmethod
    def details_format(group: Group):
        return {
            'id': group.uuid_map.uuid,
            'name': group.name,
            'permissions': [
                {
                    'id': perm.uuid_map.uuid,
                    'name': perm.name
                }
                for perm in group.permissions.all()
            ]
        }