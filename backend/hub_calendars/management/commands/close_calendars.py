from django.core.management.base import BaseCommand
from django.utils import timezone
from hub_calendars.models.calendar import Calendar
from hub_calendars.enums.calendar_status import CalendarStatus


class Command(BaseCommand):
    help = "Marca como Finalizado os calendários cujo término é hoje."

    def handle(self, *args, **options):
        today = timezone.localdate()

        updated = Calendar.objects.filter(
            end=today
        ).exclude(
            status=CalendarStatus.FINALIZADO
        ).update(status=CalendarStatus.FINALIZADO)

        self.stdout.write(self.style.SUCCESS(
            f"{updated} calendário(s) finalizado(s) para {today}."
        ))
