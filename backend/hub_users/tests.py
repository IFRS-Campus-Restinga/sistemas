from types import SimpleNamespace
from datetime import timedelta

from django.contrib.auth.models import Group, Permission
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.http import Http404
from django.test import TestCase
from django.urls import resolve
from django.utils import timezone
from hub_permissions.formatter import URLFieldsParser
from entrypoint import get_non_admin_group_permissions
from rest_framework.exceptions import ValidationError
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory
from hub_auth.services.token_service import TokenService
from hub_groups.models import GroupUUIDMap
from hub_users.models import (
    AccessRequest,
    AccountInfos,
    BindRequest,
    User,
    EmailConfirmation,
    PersonalInfos,
)
from hub_users.serializers.personal_account_infos_serializer import (
    AccessDeniedException,
    PersonalAccountInfosData,
    PersonalAccountInfosSerializer,
)
from hub_users.views.user_views import (
    confirm_email,
    create_account_visitor,
    regenerate_email_confirmation,
)
from hub_users.views.personal_account_infos_views import edit_personal_account_infos
from hub_users.services.personal_account_infos_service import PersonalAccountInfosService
from hub_users.services.email_confirmation_service import EmailConfirmationService
from hub_users.services.bind_request_service import BindRequestService
from hub_users.services.request_service import AccessRequestService
from hub_users.services.user_service import UserService


class UserServiceTests(TestCase):
    def test_non_admin_group_permissions_exclude_restricted_views(self):
        codenames = set(
            get_non_admin_group_permissions(Permission.objects.all()).values_list(
                "codename", flat=True
            )
        )

        self.assertTrue(
            {
                "change_personalinfos",
                "change_accountinfos",
            }.issubset(codenames)
        )
        self.assertTrue(
            {
                "view_group",
                "view_permission",
                "view_accessrequest",
                "view_password",
                "view_user",
            }.isdisjoint(codenames)
        )

    def test_user_model_uses_user_permission_codenames(self):
        self.assertEqual(User._meta.model_name, "user")
        self.assertEqual(settings.AUTH_USER_MODEL, "hub_users.User")

        content_type = ContentType.objects.get_for_model(User)
        codenames = set(
            Permission.objects.filter(content_type=content_type).values_list(
                "codename", flat=True
            )
        )
        self.assertTrue(
            {"add_user", "change_user", "delete_user", "view_user"}.issubset(
                codenames
            )
        )

    def test_bind_request_permissions_are_created(self):
        content_type = ContentType.objects.get(
            app_label="hub_users",
            model="bindrequest",
        )

        self.assertSetEqual(
            set(
                Permission.objects.filter(content_type=content_type).values_list(
                    "codename", flat=True
                )
            ),
            {
                "add_bindrequest",
                "change_bindrequest",
                "delete_bindrequest",
                "view_bindrequest",
            },
        )

    def test_access_request_endpoints_use_requests_prefix(self):
        self.assertEqual(
            resolve("/api/requests/get/").route,
            "api/requests/get/",
        )
        self.assertEqual(
            resolve(
                "/api/requests/00000000-0000-0000-0000-000000000000/approve/"
            ).route,
            "api/requests/<str:request_id>/approve/",
        )
        self.assertEqual(
            resolve("/api/requests/bind/").route,
            "api/requests/bind/",
        )
        self.assertEqual(
            resolve(
                "/api/requests/bind/"
                "00000000-0000-0000-0000-000000000000/approve/"
            ).route,
            "api/requests/bind/<str:request_id>/approve/",
        )
        self.assertEqual(
            resolve("/api/requests/bind/count/").route,
            "api/requests/bind/count/",
        )
        self.assertEqual(
            resolve("/api/requests/bind/pending/").route,
            "api/requests/bind/pending/",
        )

    def test_personal_account_infos_endpoints_use_model_specific_prefix(self):
        self.assertEqual(
            resolve(
                "/api/users/personal_account_infos/get/"
                "00000000-0000-0000-0000-000000000000/"
            ).route,
            "api/users/personal_account_infos/get/<str:user_id>/",
        )

    def test_server_account_creation_creates_access_request(self):
        user, created = UserService.create_user({
            "email": "server@exemplo.com",
            "first_name": "Servidor",
            "last_name": "Teste",
            "access_profile": "servidor",
        })

        self.assertTrue(created)
        self.assertTrue(AccessRequest.objects.filter(user=user).exists())
        self.assertFalse(user.is_active)

    def test_visitor_account_creation_creates_access_request(self):
        user = UserService.create_visitor_account({
            "email": "visitor@exemplo.com",
            "first_name": "Visitante",
            "last_name": "Teste",
            "password": "Safe-test-password1!",
        })

        self.assertTrue(AccessRequest.objects.filter(user=user).exists())
        self.assertFalse(user.email_verified)
        confirmation = EmailConfirmation.objects.get(user=user)
        self.assertEqual(len(confirmation.confirmation_code), 6)
        self.assertTrue(confirmation.confirmation_code.isdigit())
        self.assertGreater(confirmation.expires_at, timezone.now())
        self.assertLessEqual(
            confirmation.expires_at,
            timezone.now() + timedelta(minutes=10, seconds=1),
        )

    def test_visitor_creation_endpoint_returns_confirmation_id_only(self):
        request = APIRequestFactory().post(
            "/api/users/create/",
            {
                "email": "endpoint-visitor@exemplo.com",
                "first_name": "Cadastro",
                "last_name": "Endpoint",
                "password": "Safe-test-password1!",
            },
            format="json",
        )

        response = create_account_visitor(request)

        self.assertEqual(response.status_code, 201)
        self.assertIn("confirmation_id", response.data)
        self.assertNotIn("confirmation_code", response.data)
        self.assertTrue(
            EmailConfirmation.objects.filter(pk=response.data["confirmation_id"]).exists()
        )

    def test_confirming_email_consumes_confirmation_without_activating_account(self):
        user = UserService.create_visitor_account({
            "email": "confirmation@exemplo.com",
            "first_name": "Confirmação",
            "last_name": "Email",
            "password": "Safe-test-password1!",
        })
        confirmation = EmailConfirmation.objects.get(user=user)

        EmailConfirmationService.confirm(
            confirmation.pk,
            confirmation.confirmation_code,
        )

        user.refresh_from_db()
        self.assertTrue(user.email_verified)
        self.assertFalse(user.is_active)
        self.assertTrue(AccessRequest.objects.filter(user=user).exists())
        self.assertFalse(EmailConfirmation.objects.filter(pk=confirmation.pk).exists())

    def test_public_confirmation_endpoint_accepts_code_without_login(self):
        user = UserService.create_visitor_account({
            "email": "public-confirmation@exemplo.com",
            "first_name": "Endpoint",
            "last_name": "Público",
            "password": "Safe-test-password1!",
        })
        confirmation = EmailConfirmation.objects.get(user=user)
        request = APIRequestFactory().post(
            f"/api/users/email-confirmation/{confirmation.pk}/",
            {"confirmation_code": confirmation.confirmation_code},
            format="json",
        )

        response = confirm_email(request, confirmation.pk)

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.email_verified)

    def test_regenerate_confirmation_replaces_code_and_renews_expiration(self):
        user = UserService.create_visitor_account({
            "email": "regenerate-confirmation@exemplo.com",
            "first_name": "Novo",
            "last_name": "Código",
            "password": "Safe-test-password1!",
        })
        confirmation = EmailConfirmation.objects.get(user=user)
        old_code = confirmation.confirmation_code
        confirmation.expires_at = timezone.now() - timedelta(minutes=2)
        confirmation.save(update_fields=["expires_at"])
        request = APIRequestFactory().put(
            f"/api/users/email-confirmation/{confirmation.pk}/regenerate/",
            {},
            format="json",
        )
        started_at = timezone.now()

        response = regenerate_email_confirmation(request, confirmation.pk)

        self.assertEqual(response.status_code, 200)
        confirmation.refresh_from_db()
        self.assertNotEqual(confirmation.confirmation_code, old_code)
        self.assertEqual(len(confirmation.confirmation_code), 6)
        self.assertTrue(confirmation.confirmation_code.isdigit())
        self.assertGreaterEqual(confirmation.expires_at, started_at + timedelta(minutes=9, seconds=59))
        self.assertLessEqual(confirmation.expires_at, started_at + timedelta(minutes=10, seconds=1))

    def test_email_confirmation_rejects_wrong_and_expired_codes(self):
        user = UserService.create_visitor_account({
            "email": "expired-confirmation@exemplo.com",
            "first_name": "Confirmação",
            "last_name": "Expirada",
            "password": "Safe-test-password1!",
        })
        confirmation = EmailConfirmation.objects.get(user=user)

        with self.assertRaises(ValidationError):
            wrong_code = (
                "000000"
                if confirmation.confirmation_code != "000000"
                else "000001"
            )
            EmailConfirmationService.confirm(confirmation.pk, wrong_code)

        confirmation.expires_at = timezone.now() - timedelta(seconds=1)
        confirmation.save(update_fields=["expires_at"])
        with self.assertRaises(ValidationError):
            EmailConfirmationService.confirm(
                confirmation.pk,
                confirmation.confirmation_code,
            )

        user.refresh_from_db()
        self.assertFalse(user.email_verified)

    def test_unconfirmed_guest_cannot_be_approved(self):
        user = User.objects.create(
            email="unconfirmed-guest@exemplo.com",
            username="Convidado",
            access_profile="convidado",
            email_verified=False,
        )
        access_request = AccessRequest.objects.create(user=user)
        group, _ = Group.objects.get_or_create(name="user")
        group_map, _ = GroupUUIDMap.objects.get_or_create(group=group)

        with self.assertRaises(ValidationError):
            AccessRequestService.approve(
                {"groups": [{"id": str(group_map.uuid)}]},
                str(access_request.pk),
            )

        user.refresh_from_db()
        self.assertFalse(user.is_active)
        self.assertTrue(AccessRequest.objects.filter(pk=access_request.pk).exists())

    def test_approving_access_request_activates_user_and_removes_request(self):
        user = User.objects.create(
            email="approval@exemplo.com",
            username="Aprovar",
            access_profile="servidor",
        )
        access_request = AccessRequest.objects.create(user=user)
        group, _ = Group.objects.get_or_create(name="user")
        group_map, _ = GroupUUIDMap.objects.get_or_create(group=group)

        AccessRequestService.approve(
            {
                "groups": [{"id": str(group_map.uuid)}],
                "is_abstract": False,
            },
            str(access_request.pk),
        )

        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertFalse(AccessRequest.objects.filter(pk=access_request.pk).exists())
        self.assertTrue(user.groups.filter(pk=group.pk).exists())

    def test_rejecting_access_request_deletes_request_and_user(self):
        user = User.objects.create(
            email="rejection@exemplo.com",
            username="Rejeitar",
            access_profile="servidor",
        )
        user_id = user.pk
        AccessRequest.objects.create(user=user)

        access_request = AccessRequest.objects.get(user_id=user_id)
        AccessRequestService.reject(str(access_request.pk))

        self.assertFalse(User.objects.filter(pk=user_id).exists())
        self.assertFalse(AccessRequest.objects.filter(user_id=user_id).exists())

    def test_access_request_list_returns_request_id_and_associated_user_id(self):
        user = User.objects.create(
            email="listed-request@exemplo.com",
            username="Solicitante",
            access_profile="servidor",
        )
        access_request = AccessRequest.objects.create(user=user)
        request = Request(
            APIRequestFactory().get(
                "/api/requests/get/",
                {"fields": "id,username,email,access_profile"},
            )
        )

        response = AccessRequestService.list(request)
        listed = response.data["results"][0]

        self.assertEqual(listed["id"], str(access_request.pk))
        self.assertEqual(listed["user_id"], str(user.pk))

    def test_get_personal_account_infos_returns_both_models_for_owner(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        account_infos = AccountInfos.objects.create(
            registration="1234567",
            telephone_number="(11)999999999",
        )
        user = User.objects.create(
            email="owner@exemplo.com",
            username="Dono",
            access_profile="servidor",
            personal_infos=personal_infos,
            account_infos=account_infos,
        )
        access_token, _ = TokenService.pair_token(user)
        request = SimpleNamespace(
            COOKIES={settings.AUTH_COOKIE_NAME: access_token},
            GET={
                "fields": "personal_infos.cpf,personal_infos.birth_date,account_infos.registration,account_infos.telephone_number",
            },
        )

        result = PersonalAccountInfosService.get(request, str(user.pk))

        self.assertEqual(result["personal_infos"]["cpf"], personal_infos.cpf)
        self.assertEqual(result["personal_infos"]["birth_date"].isoformat(), "1990-01-01")
        self.assertEqual(result["account_infos"]["registration"], account_infos.registration)
        self.assertEqual(result["account_infos"]["telephone_number"], account_infos.telephone_number)

    def test_owner_can_edit_personal_account_infos_but_other_users_cannot(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        account_infos = AccountInfos.objects.create(
            registration="1234567",
            telephone_number="(11)999999999",
        )
        owner = User.objects.create(
            email="edit-owner@exemplo.com",
            username="Dono",
            access_profile="servidor",
            personal_infos=personal_infos,
            account_infos=account_infos,
        )
        other = User.objects.create(
            email="edit-other@exemplo.com",
            username="Outro",
            access_profile="servidor",
        )
        owner_token, _ = TokenService.pair_token(owner)
        payload = {
            "user": str(owner.pk),
            "personal_infos": {"cpf": "11144477735", "birth_date": "1991-02-03"},
            "account_infos": {"registration": "7654321", "telephone_number": "11988888888"},
        }

        PersonalAccountInfosService.edit(
            SimpleNamespace(
                data=payload,
                COOKIES={settings.AUTH_COOKIE_NAME: owner_token},
            ),
            str(owner.pk),
        )

        owner.refresh_from_db()
        self.assertEqual(owner.personal_infos.cpf, payload["personal_infos"]["cpf"])
        self.assertEqual(owner.personal_infos.birth_date.isoformat(), payload["personal_infos"]["birth_date"])
        self.assertEqual(owner.account_infos.registration, payload["account_infos"]["registration"])
        self.assertEqual(owner.account_infos.telephone_number, payload["account_infos"]["telephone_number"])

        other_token, _ = TokenService.pair_token(other)
        with self.assertRaises(AccessDeniedException):
            PersonalAccountInfosService.edit(
                SimpleNamespace(
                    data=payload,
                    COOKIES={settings.AUTH_COOKIE_NAME: other_token},
                ),
                str(owner.pk),
            )

    def test_editing_with_another_accounts_cpf_creates_bind_request(self):
        existing_personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        account_infos = AccountInfos.objects.create(
            registration="7654321",
            telephone_number="11988888888",
        )
        user = User.objects.create(
            email="edit-bind-requester@exemplo.com",
            username="Solicitante",
            access_profile="servidor",
            account_infos=account_infos,
        )
        owner = User.objects.create(
            email="edit-bind-owner@exemplo.com",
            username="Titular",
            access_profile="servidor",
            personal_infos=existing_personal_infos,
        )
        access_token, _ = TokenService.pair_token(user)
        payload = {
            "user": str(user.pk),
            "personal_infos": {
                "cpf": existing_personal_infos.cpf,
                "birth_date": "1990-01-01",
            },
            "account_infos": {
                "registration": "7654321",
                "telephone_number": "11988888888",
            },
        }

        PersonalAccountInfosService.edit(
            SimpleNamespace(
                data=payload,
                COOKIES={settings.AUTH_COOKIE_NAME: access_token},
            ),
            str(user.pk),
        )

        user.refresh_from_db()
        self.assertIsNone(user.personal_infos_id)
        self.assertEqual(user.account_infos_id, account_infos.pk)
        self.assertTrue(
            BindRequest.objects.filter(
                user=user,
                personal_infos=owner.personal_infos,
            ).exists()
        )
        self.assertEqual(
            PersonalInfos.objects.filter(cpf=existing_personal_infos.cpf).count(),
            1,
        )

    def test_edit_personal_account_infos_requires_authentication_not_change_permissions(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        account_infos = AccountInfos.objects.create(
            registration="1234567",
            telephone_number="(11)999999999",
        )
        user = User.objects.create(
            email="endpoint-owner@exemplo.com",
            username="Dono",
            access_profile="servidor",
            is_active=True,
            personal_infos=personal_infos,
            account_infos=account_infos,
        )
        access_token, _ = TokenService.pair_token(user)
        payload = {
            "user": str(user.pk),
            "personal_infos": {"cpf": "11144477735", "birth_date": "1991-02-03"},
            "account_infos": {"registration": "7654321", "telephone_number": "11988888888"},
        }
        request = APIRequestFactory().put(
            f"/api/users/personal_account_infos/edit/{user.pk}/",
            payload,
            format="json",
        )
        request.COOKIES[settings.AUTH_COOKIE_NAME] = access_token

        response = edit_personal_account_infos(request, str(user.pk))

        self.assertEqual(response.status_code, 200)

    def test_edit_personal_account_infos_hides_sensitive_validation_details(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        PersonalInfos.objects.create(
            cpf="11144477735",
            birth_date="1991-02-03",
        )
        account_infos = AccountInfos.objects.create(
            registration="1234567",
            telephone_number="(11)999999999",
        )
        user = User.objects.create(
            email="generic-error@exemplo.com",
            username="Erro genérico",
            access_profile="servidor",
            is_active=True,
            personal_infos=personal_infos,
            account_infos=account_infos,
        )
        access_token, _ = TokenService.pair_token(user)
        request = APIRequestFactory().put(
            f"/api/users/personal_account_infos/edit/{user.pk}/",
            {
                "user": str(user.pk),
                "personal_infos": {
                    "cpf": "11144477735",
                    "birth_date": "1990-01-01",
                },
                "account_infos": {
                    "registration": "7654321",
                    "telephone_number": "11988888888",
                },
            },
            format="json",
        )
        request.COOKIES[settings.AUTH_COOKIE_NAME] = access_token

        response = edit_personal_account_infos(request, str(user.pk))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {"message": "Ocorreu um erro"})

    def test_get_personal_account_infos_denies_other_users_and_allows_admin(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        account_infos = AccountInfos.objects.create(
            registration="1234567",
            telephone_number="(11)999999999",
        )
        target = User.objects.create(
            email="target@exemplo.com",
            username="Alvo",
            access_profile="servidor",
            personal_infos=personal_infos,
            account_infos=account_infos,
        )
        other = User.objects.create(
            email="other@exemplo.com",
            username="Outro",
            access_profile="servidor",
        )
        other_token, _ = TokenService.pair_token(other)
        serializer = PersonalAccountInfosSerializer(
            context={
                "request": SimpleNamespace(
                    COOKIES={settings.AUTH_COOKIE_NAME: other_token}
                )
            }
        )

        with self.assertRaises(AccessDeniedException):
            serializer._check_access_read(PersonalAccountInfosData(target))

        admin_group, _ = Group.objects.get_or_create(name="admin")
        other.groups.add(admin_group)
        admin_token, _ = TokenService.pair_token(other)
        serializer = PersonalAccountInfosSerializer(
            context={
                "request": SimpleNamespace(
                    COOKIES={settings.AUTH_COOKIE_NAME: admin_token}
                )
            }
        )

        serializer._check_access_read(PersonalAccountInfosData(target))

    def test_get_personal_account_infos_allows_users_linked_to_shared_records(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        account_infos = AccountInfos.objects.create(
            registration="1234567",
            telephone_number="(11)999999999",
        )
        target = User.objects.create(
            email="shared-target@exemplo.com",
            username="Alvo compartilhado",
            access_profile="servidor",
            personal_infos=personal_infos,
            account_infos=account_infos,
        )
        requester = User.objects.create(
            email="shared-requester@exemplo.com",
            username="Solicitante compartilhado",
            access_profile="servidor",
            personal_infos=personal_infos,
            account_infos=account_infos,
        )
        access_token, _ = TokenService.pair_token(requester)
        serializer = PersonalAccountInfosSerializer(
            context={
                "request": SimpleNamespace(
                    COOKIES={settings.AUTH_COOKIE_NAME: access_token}
                )
            }
        )

        serializer._check_access_read(PersonalAccountInfosData(target))

    def test_get_personal_account_infos_denies_partial_record_matches(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        target_account_infos = AccountInfos.objects.create(
            registration="1234567",
            telephone_number="(11)999999999",
        )
        requester_account_infos = AccountInfos.objects.create(
            registration="7654321",
            telephone_number="(22)988888888",
        )
        target = User.objects.create(
            email="partial-target@exemplo.com",
            username="Alvo parcial",
            access_profile="servidor",
            personal_infos=personal_infos,
            account_infos=target_account_infos,
        )
        requester = User.objects.create(
            email="partial-requester@exemplo.com",
            username="Solicitante parcial",
            access_profile="servidor",
            personal_infos=personal_infos,
            account_infos=requester_account_infos,
        )
        access_token, _ = TokenService.pair_token(requester)
        serializer = PersonalAccountInfosSerializer(
            context={
                "request": SimpleNamespace(
                    COOKIES={settings.AUTH_COOKIE_NAME: access_token}
                )
            }
        )

        with self.assertRaises(AccessDeniedException):
            serializer._check_access_read(PersonalAccountInfosData(target))

    def test_create_personal_account_infos_requests_binding_to_existing_personal_infos(self):
        first_user = User.objects.create(
            email="first@exemplo.com",
            username="Primeiro",
            access_profile="servidor",
        )
        second_user = User.objects.create(
            email="second@exemplo.com",
            username="Segundo",
            access_profile="servidor",
        )
        payload = {
            "user": str(first_user.pk),
            "personal_infos": {"cpf": "52998224725", "birth_date": "1990-01-01"},
            "account_infos": {"telephone_number": "(11)999999999", "registration": "1234567"},
        }

        PersonalAccountInfosService.create(
            SimpleNamespace(data=payload, COOKIES={})
        )
        payload["user"] = str(second_user.pk)
        PersonalAccountInfosService.create(
            SimpleNamespace(data=payload, COOKIES={})
        )

        first_user.refresh_from_db()
        second_user.refresh_from_db()
        self.assertEqual(PersonalInfos.objects.count(), 1)
        self.assertEqual(AccountInfos.objects.count(), 1)
        self.assertEqual(first_user.personal_infos_id, PersonalInfos.objects.get().pk)
        self.assertIsNone(second_user.personal_infos_id)
        self.assertEqual(second_user.account_infos_id, first_user.account_infos_id)
        self.assertTrue(
            BindRequest.objects.filter(
                user=second_user,
                personal_infos=first_user.personal_infos,
            ).exists()
        )

    def test_create_personal_account_infos_does_not_duplicate_bind_request(self):
        user = User.objects.create(
            email="repeat-bind@exemplo.com",
            username="Vínculo repetido",
            access_profile="servidor",
        )
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        User.objects.create(
            email="existing-bind@exemplo.com",
            username="Vínculo existente",
            access_profile="servidor",
            personal_infos=personal_infos,
        )
        payload = {
            "user": str(user.pk),
            "personal_infos": {"cpf": personal_infos.cpf, "birth_date": "1990-01-01"},
            "account_infos": {"telephone_number": "(11)999999999", "registration": "1234567"},
        }

        PersonalAccountInfosService.create(SimpleNamespace(data=payload, COOKIES={}))
        PersonalAccountInfosService.create(SimpleNamespace(data=payload, COOKIES={}))

        self.assertEqual(
            BindRequest.objects.filter(
                user=user,
                personal_infos=personal_infos,
            ).count(),
            1,
        )

    def test_bind_request_list_only_returns_requests_for_account_personal_infos(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        other_personal_infos = PersonalInfos.objects.create(
            cpf="11144477735",
            birth_date="1991-02-03",
        )
        owner = User.objects.create(
            email="bind-owner@exemplo.com",
            username="Titular",
            access_profile="servidor",
            personal_infos=personal_infos,
        )
        requester = User.objects.create(
            email="bind-requester@exemplo.com",
            username="Solicitante",
            access_profile="aluno",
        )
        requester.groups.add(Group.objects.create(name="aluno"))
        other_requester = User.objects.create(
            email="other-bind-requester@exemplo.com",
            username="Outro solicitante",
            access_profile="servidor",
        )
        BindRequest.objects.create(user=requester, personal_infos=personal_infos)
        BindRequest.objects.create(
            user=other_requester,
            personal_infos=other_personal_infos,
        )
        access_token, _ = TokenService.pair_token(owner)
        request = Request(
            APIRequestFactory().get("/api/requests/bind/")
        )
        request._request.COOKIES[settings.AUTH_COOKIE_NAME] = access_token

        response = BindRequestService.list(request)

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"],
            [
                {
                    "id": str(BindRequest.objects.get(user=requester).pk),
                    "username": requester.username,
                    "email": requester.email,
                    "access_profile": requester.access_profile,
                }
            ],
        )

    def test_bind_request_count_only_includes_current_accounts_personal_infos(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        account_user = User.objects.create(
            email="count-bind-owner@exemplo.com",
            username="Titular",
            access_profile="servidor",
            personal_infos=personal_infos,
        )
        requester = User.objects.create(
            email="count-bind-requester@exemplo.com",
            username="Solicitante",
            access_profile="aluno",
        )
        BindRequest.objects.create(user=requester, personal_infos=personal_infos)
        access_token, _ = TokenService.pair_token(account_user)

        count = BindRequestService.count(
            SimpleNamespace(COOKIES={settings.AUTH_COOKIE_NAME: access_token})
        )

        self.assertEqual(count, 1)

    def test_pending_bind_request_checks_authenticated_requester(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        requester = User.objects.create(
            email="pending-bind-requester@exemplo.com",
            username="Solicitante",
            access_profile="aluno",
        )
        BindRequest.objects.create(user=requester, personal_infos=personal_infos)
        access_token, _ = TokenService.pair_token(requester)

        pending = BindRequestService.pending(
            SimpleNamespace(COOKIES={settings.AUTH_COOKIE_NAME: access_token})
        )

        self.assertTrue(pending)

    def test_approving_bind_request_links_personal_infos_without_deleting_requester(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        owner = User.objects.create(
            email="approve-bind-owner@exemplo.com",
            username="Titular",
            access_profile="servidor",
            personal_infos=personal_infos,
        )
        requester = User.objects.create(
            email="approve-bind-requester@exemplo.com",
            username="Solicitante",
            access_profile="aluno",
        )
        bind_request = BindRequest.objects.create(
            user=requester,
            personal_infos=personal_infos,
        )
        access_token, _ = TokenService.pair_token(owner)

        BindRequestService.approve(
            SimpleNamespace(COOKIES={settings.AUTH_COOKIE_NAME: access_token}),
            str(bind_request.pk),
        )

        requester.refresh_from_db()
        self.assertEqual(requester.personal_infos_id, personal_infos.pk)
        self.assertTrue(User.objects.filter(pk=requester.pk).exists())
        self.assertFalse(BindRequest.objects.filter(pk=bind_request.pk).exists())

    def test_rejecting_bind_request_keeps_requester_and_does_not_link_infos(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        owner = User.objects.create(
            email="reject-bind-owner@exemplo.com",
            username="Titular",
            access_profile="servidor",
            personal_infos=personal_infos,
        )
        requester = User.objects.create(
            email="reject-bind-requester@exemplo.com",
            username="Solicitante",
            access_profile="aluno",
            account_infos=AccountInfos.objects.create(
                registration="7654321",
                telephone_number="11988888888",
            ),
            first_login=False,
        )
        account_infos_id = requester.account_infos_id
        bind_request = BindRequest.objects.create(
            user=requester,
            personal_infos=personal_infos,
        )
        access_token, _ = TokenService.pair_token(owner)

        BindRequestService.reject(
            SimpleNamespace(COOKIES={settings.AUTH_COOKIE_NAME: access_token}),
            str(bind_request.pk),
        )

        requester.refresh_from_db()
        self.assertIsNone(requester.personal_infos_id)
        self.assertIsNone(requester.account_infos_id)
        self.assertTrue(requester.first_login)
        self.assertTrue(User.objects.filter(pk=requester.pk).exists())
        self.assertFalse(BindRequest.objects.filter(pk=bind_request.pk).exists())
        self.assertFalse(AccountInfos.objects.filter(pk=account_infos_id).exists())

    def test_rejecting_bind_request_keeps_account_infos_shared_with_another_user(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        account_infos = AccountInfos.objects.create(
            registration="7654321",
            telephone_number="11988888888",
        )
        owner = User.objects.create(
            email="reject-shared-owner@exemplo.com",
            username="Titular",
            access_profile="servidor",
            personal_infos=personal_infos,
        )
        requester = User.objects.create(
            email="reject-shared-requester@exemplo.com",
            username="Solicitante",
            access_profile="aluno",
            account_infos=account_infos,
        )
        other_user = User.objects.create(
            email="reject-shared-other@exemplo.com",
            username="Outra conta",
            access_profile="servidor",
            account_infos=account_infos,
        )
        bind_request = BindRequest.objects.create(
            user=requester,
            personal_infos=personal_infos,
        )
        access_token, _ = TokenService.pair_token(owner)

        BindRequestService.reject(
            SimpleNamespace(COOKIES={settings.AUTH_COOKIE_NAME: access_token}),
            str(bind_request.pk),
        )

        requester.refresh_from_db()
        other_user.refresh_from_db()
        self.assertIsNone(requester.account_infos_id)
        self.assertEqual(other_user.account_infos_id, account_infos.pk)
        self.assertTrue(AccountInfos.objects.filter(pk=account_infos.pk).exists())

    def test_account_cannot_approve_bind_request_for_another_accounts_infos(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        other_personal_infos = PersonalInfos.objects.create(
            cpf="11144477735",
            birth_date="1991-02-03",
        )
        owner = User.objects.create(
            email="wrong-bind-owner@exemplo.com",
            username="Titular",
            access_profile="servidor",
            personal_infos=other_personal_infos,
        )
        requester = User.objects.create(
            email="wrong-bind-requester@exemplo.com",
            username="Solicitante",
            access_profile="aluno",
        )
        bind_request = BindRequest.objects.create(
            user=requester,
            personal_infos=personal_infos,
        )
        access_token, _ = TokenService.pair_token(owner)

        with self.assertRaises(Http404):
            BindRequestService.approve(
                SimpleNamespace(COOKIES={settings.AUTH_COOKIE_NAME: access_token}),
                str(bind_request.pk),
            )

        self.assertTrue(BindRequest.objects.filter(pk=bind_request.pk).exists())

    def test_create_personal_account_infos_does_not_persist_when_account_data_is_invalid(self):
        user = User.objects.create(
            email="invalid@exemplo.com",
            username="Inválido",
            access_profile="servidor",
        )
        payload = {
            "user": str(user.pk),
            "personal_infos": {"cpf": "52998224725", "birth_date": "1990-01-01"},
            "account_infos": {"telephone_number": "inválido", "registration": "1234567"},
        }

        with self.assertRaises(ValidationError):
            PersonalAccountInfosService.create(
                SimpleNamespace(data=payload, COOKIES={})
            )

        self.assertEqual(PersonalInfos.objects.count(), 0)
        self.assertEqual(AccountInfos.objects.count(), 0)

    def test_multiple_users_can_share_personal_and_account_infos(self):
        personal_infos = PersonalInfos.objects.create(
            cpf="52998224725",
            birth_date="1990-01-01",
        )
        account_infos = AccountInfos.objects.create(
            registration="1234567",
            telephone_number="(11)999999999",
        )
        users = [
            User.objects.create(
                email=f"user{index}@exemplo.com",
                username=f"Usuário {index}",
                access_profile="servidor",
                personal_infos=personal_infos,
                account_infos=account_infos,
            )
            for index in range(2)
        ]

        self.assertEqual(personal_infos.users.count(), 2)
        self.assertEqual(account_infos.users.count(), 2)
        self.assertEqual(
            list(User.objects.filter(personal_infos=personal_infos)),
            users,
        )

    def test_build_user_data_sets_personal_and_account_infos_to_null_without_infos(self):
        user = User.objects.create(
            email='teste@exemplo.com',
            username='Teste',
            access_profile='servidor',
            first_login=True,
            is_abstract=False,
        )

        data = UserService.build_user_data(user)

        self.assertTrue(data['first_login'])
        self.assertIsNone(data['personal_infos'])
        self.assertIsNone(data['account_infos'])
        self.assertFalse(data['is_abstract'])
        self.assertTrue(data['first_login'] and data['personal_infos'] is None and data['account_infos'] is None and not data['is_abstract'])

    def test_build_user_data_for_abstract_account_does_not_trigger_infos_redirect(self):
        user = User.objects.create(
            email='departamento@exemplo.com',
            username='Departamento',
            access_profile='servidor',
            first_login=True,
            is_abstract=True,
        )

        data = UserService.build_user_data(user)

        self.assertTrue(data['first_login'])
        self.assertIsNone(data['personal_infos'])
        self.assertIsNone(data['account_infos'])
        self.assertTrue(data['is_abstract'])
        self.assertFalse(data['first_login'] and data['personal_infos'] is None and data['account_infos'] is None and not data['is_abstract'])

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

    def test_permission_name_translates_capitalized_model_names(self):
        content_type = ContentType.objects.get(app_label='hub_users', model='accessrequest')
        permission = Permission.objects.filter(content_type=content_type, codename='view_accessrequest').first()

        if permission is None:
            permission = Permission.objects.create(
                name='Can view Access request',
                codename='view_accessrequest',
                content_type=content_type,
            )
        else:
            permission.name = 'Can view Access request'
            permission.save(update_fields=['name'])

        parsed = URLFieldsParser.parse(permission, 'id,name')

        self.assertEqual(parsed['name'], 'Pode visualizar Solicitações de Acesso')
