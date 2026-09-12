from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from hub_permissions.formatter import URLFieldsParser
from hub_users.models import CustomUser
from hub_users.services.user_service import UserService


class UserServiceTests(TestCase):
    def test_build_user_data_sets_additional_infos_to_null_for_personal_account_without_infos(self):
        user = CustomUser.objects.create(
            email='teste@exemplo.com',
            username='Teste',
            access_profile='servidor',
            first_login=True,
            is_abstract=False,
        )

        data = UserService.build_user_data(user)

        self.assertTrue(data['first_login'])
        self.assertIsNone(data['additional_infos'])
        self.assertFalse(data['is_abstract'])
        self.assertTrue(data['first_login'] and data['additional_infos'] is None and not data['is_abstract'])

    def test_build_user_data_for_abstract_account_does_not_trigger_additional_info_redirect(self):
        user = CustomUser.objects.create(
            email='departamento@exemplo.com',
            username='Departamento',
            access_profile='servidor',
            first_login=True,
            is_abstract=True,
        )

        data = UserService.build_user_data(user)

        self.assertTrue(data['first_login'])
        self.assertIsNone(data['additional_infos'])
        self.assertTrue(data['is_abstract'])
        self.assertFalse(data['first_login'] and data['additional_infos'] is None and not data['is_abstract'])

    def test_permission_name_falls_back_to_codename_when_blank(self):
        content_type = ContentType.objects.get(app_label='hub_academic', model='curriculum')
        permission = Permission.objects.filter(content_type=content_type, codename='delete_curriculum').first()

        if permission is None:
            permission = Permission.objects.create(
                name='',
                codename='delete_curriculum',
                content_type=content_type,
            )
        else:
            permission.name = ''
            permission.save(update_fields=['name'])

        parsed = URLFieldsParser.parse(permission, 'id,name')

        self.assertEqual(parsed['name'], 'Pode excluir currículo')
