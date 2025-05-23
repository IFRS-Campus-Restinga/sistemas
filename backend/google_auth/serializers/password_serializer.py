import re
from rest_framework import serializers
from google_auth.models import Password
from django.contrib.auth.hashers import make_password


class Password_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Password
        fields = '__all__'

    def save(self, **kwargs):
        if 'password' in self.validated_data:
            raw_password = self.validated_data['password']
            self.validated_data['password'] = make_password(raw_password)

        return super().save(**kwargs)

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("A senha deve ter no mínimo 8 caracteres.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("A senha deve conter ao menos uma letra maiúscula.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("A senha deve conter ao menos um número.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("A senha deve conter ao menos um caractere especial.")

        return value
