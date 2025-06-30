from django.contrib.auth.models import Group

class FormatGroupData:
    @staticmethod
    def list_format(instance: Group):
        formatted_name = instance.name.replace('_', ' ').title()

        return {
            'id': instance.id,
            'Nome': formatted_name,
        }
    
    @staticmethod
    def details_format(instance: Group):
        return