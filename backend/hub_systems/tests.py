from django.test import TestCase

from hub_systems.serializer import SystemSerializer
from hub_users.models import User


class SystemSerializerTests(TestCase):
    def setUp(self):
        self.system_data = {
            "name": "Sistema de teste",
            "system_url": "https://sistema.exemplo.edu",
            "is_active": True,
            "current_state": "Em desenvolvimento",
            "secret_key": "secret-key-for-tests",
        }

    def test_system_requires_at_least_one_developer_student(self):
        serializer = SystemSerializer(data={**self.system_data, "dev_team": []})

        self.assertFalse(serializer.is_valid())
        self.assertIn("dev_team", serializer.errors)

    def test_system_accepts_active_student_as_developer(self):
        student = User.objects.create(
            email="student@exemplo.edu",
            username="Aluno",
            access_profile="aluno",
            is_active=True,
        )
        serializer = SystemSerializer(
            data={**self.system_data, "dev_team": [str(student.pk)]}
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
