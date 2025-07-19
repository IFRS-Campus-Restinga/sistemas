from hub_calendars.models.event import Event

class FormatEventData:
    @staticmethod
    def list_format(instance: Event):
        return {
            'id': instance.id,
            'title': instance.title,
            "start": instance.start,
            "end": instance.end,
            'category': instance.category,
            'type': instance.type,
            'calendar': instance.calendar.id
        }
    
    @staticmethod
    def details_format(instance: Event):
        return {
            'id': instance.id,
            'title': instance.title,
            "start": instance.start,
            "end": instance.end,
            'category': instance.category,
            'type': instance.type,
            'calendar': instance.calendar.id,
            'description': instance.description
        }