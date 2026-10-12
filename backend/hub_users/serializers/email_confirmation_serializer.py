from rest_framework import serializers


class EmailConfirmationSerializer(serializers.Serializer):
    confirmation_code = serializers.RegexField(regex=r"^\d{6}$")
