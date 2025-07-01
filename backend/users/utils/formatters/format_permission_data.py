from django.contrib.auth.models import Permission

class FormatPermissionData:
    @staticmethod
    def list_format(instance: Permission):
        formatted_name = instance.name.replace('_', ' ').title()

        return {
            'id': instance.uuid_map.uuid,
            'name': formatted_name,
        }