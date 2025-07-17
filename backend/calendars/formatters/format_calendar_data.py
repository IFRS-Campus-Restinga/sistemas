from calendars.models.calendar import Calendar

class FormatCalendarData:
    @staticmethod
    def list_format(instance: Calendar):
        return {
            'id': instance.id,
            'titulo': instance.title,
            "inicio": instance.start.strftime('%d/%m/%Y') if instance.start else None,
            "fim": instance.end.strftime('%d/%m/%Y') if instance.end else None,
            'status' : instance.status,
        }
    
    @staticmethod
    def details_format(instance: Calendar):
        return {
            'id': instance.id,
            'title': instance.title,
            "start": instance.start,
            "end": instance.end,
            'status': instance.status,
        }