from hub_users.models import CustomUser, Password
from hub_users.serializers.password_serializer import Password_Serializer
from rest_framework import serializers
from django.contrib.auth.hashers import check_password, make_password

class PasswordService:
    @staticmethod
    def create(user: CustomUser, password: str):
        password_serializer = Password_Serializer(data={'user': user.id, 'password': password})

        if not password_serializer.is_valid():
            raise serializers.ValidationError(password_serializer.errors)
        
        hashed_password = make_password(password)

        Password.objects.create(user=user, password=hashed_password)

    @staticmethod
    def check(user:CustomUser, password: str):
        hashed_password = Password.objects.get(user=user).password

        return check_password(password=password, encoded=hashed_password)

