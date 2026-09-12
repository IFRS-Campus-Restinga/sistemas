from django.db.models import TextChoices

class CourseShift(TextChoices):
    MORNING = 'Manhã'
    AFTERNOON = 'Tarde'
    NIGHT = 'Noite'