import re
import uuid
import unicodedata
from rest_framework import serializers
from django.contrib.auth.models import Group, Permission
from .models import GroupUUIDMap
from .formatter import URLFieldsParser

def format_string(text: str) -> str:
    # Converte para minúsculas
    text = text.lower()

    # Remove acentos
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ASCII', 'ignore').decode('utf-8')

    # Substitui espaços por _
    text = text.replace(' ', '_')

    # Remove qualquer caractere que não seja letra, número ou _
    text = re.sub(r'[^\w_]', '', text)

    return text

class GroupSerializer(serializers.ModelSerializer):
    permissions_to_add = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), required=False
    )
    permissions_to_remove = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), required=False
    )

    class Meta:
        model = Group
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True}
        }

    def to_representation(self, instance):
        request = self.context.get('request')
        fields = request.GET.get("fields", None)

        if not fields:
            raise serializers.ValidationError('O campo fields não pode ser nulo.')
        
        return URLFieldsParser.parse(instance, fields)
        

    def create(self, validated_data):
        permissions_to_add = validated_data.pop('permissions_to_add', [])

        # Obtem ou cria o grupo pelo nome
        group_name = validated_data.get('name')
        
        group, created = Group.objects.get_or_create(name=format_string(group_name))

        # Atribui permissões (mesmo se já existia)
        if permissions_to_add:
            group.permissions.add(*permissions_to_add)

        # Cria UUIDMap apenas se o grupo for novo
        if created:
            GroupUUIDMap.objects.create(group=group)

        return group

    def update(self, instance, validated_data):
        permissions_to_add = validated_data.pop('permissions_to_add', [])
        permissions_to_remove = validated_data.pop('permissions_to_remove', [])

        instance.name = format_string(validated_data.get('name', instance.name))
        instance.save()

        if permissions_to_add:
            perms_ids = [p.pk if hasattr(p, 'pk') else p for p in permissions_to_add]
            instance.permissions.add(*perms_ids)

        if permissions_to_remove:
            perms_ids = [p.pk if hasattr(p, 'pk') else p for p in permissions_to_remove]
            instance.permissions.remove(*perms_ids)

        return instance
