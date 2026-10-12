import secrets
import uuid
from datetime import timedelta

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers

from hub_users.models import EmailConfirmation


class EmailConfirmationService:
    @staticmethod
    def _generate_code(previous_code=None):
        code = f"{secrets.randbelow(1_000_000):06d}"
        while code == previous_code:
            code = f"{secrets.randbelow(1_000_000):06d}"
        return code

    @staticmethod
    def create(user):
        return EmailConfirmation.objects.create(
            user=user,
            confirmation_code=EmailConfirmationService._generate_code(),
            expires_at=timezone.now() + timedelta(minutes=10),
        )

    @staticmethod
    @transaction.atomic
    def regenerate(confirmation_id):
        confirmation = get_object_or_404(
            EmailConfirmation.objects.select_for_update(),
            pk=uuid.UUID(str(confirmation_id)),
        )
        confirmation.confirmation_code = EmailConfirmationService._generate_code(
            confirmation.confirmation_code
        )
        confirmation.expires_at = timezone.now() + timedelta(minutes=10)
        confirmation.save(update_fields=["confirmation_code", "expires_at"])
        return confirmation

    @staticmethod
    @transaction.atomic
    def confirm(confirmation_id, confirmation_code):
        confirmation = get_object_or_404(
            EmailConfirmation.objects.select_related("user"),
            pk=uuid.UUID(str(confirmation_id)),
        )

        if timezone.now() >= confirmation.expires_at:
            raise serializers.ValidationError("O código de confirmação expirou.")

        if (
            not isinstance(confirmation_code, str)
            or len(confirmation_code) != 6
            or not confirmation_code.isdigit()
            or not secrets.compare_digest(
                confirmation.confirmation_code, confirmation_code
            )
        ):
            raise serializers.ValidationError("Código de confirmação inválido.")

        user = confirmation.user
        user.email_verified = True
        user.save(update_fields=["email_verified"])
        confirmation.delete()
        return user
