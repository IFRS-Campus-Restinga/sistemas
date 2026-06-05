import os
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)

environ.Env.read_env(BASE_DIR / ".env")

# ------------------------------------------------------------------------------
# CORE
# ------------------------------------------------------------------------------
SECRET_KEY = env("SECRET_KEY", default="django-insecure-j$zon4heht3ss&b+9%n%)189=n+efwtb%&_w#xryx^6wpu0fhx")
DEBUG = env.bool("DEBUG", default=True)
ENVIRONMENT = env("ENVIRONMENT", default="dev").lower()

GOOGLE_OAUTH2_CLIENT_ID = env("GOOGLE_OAUTH2_CLIENT_ID", default="")
GOOGLE_OAUTH2_CLIENT_SECRET = env("GOOGLE_OAUTH2_CLIENT_SECRET", default="")
REDIRECT_URI = env("REDIRECT_URI", default="")
BASE_SYSTEM_URL = env("BASE_SYSTEM_URL", default="http://localhost:8000")

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["*"])

# ------------------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------------------
CORS_ALLOW_CREDENTIALS = True

X_FRAME_OPTIONS = "ALLOWALL"
SECURE_CROSS_ORIGIN_OPENER_POLICY = None
CSP_FRAME_ANCESTORS = ("https://accounts.google.com",)

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ],
)

# ------------------------------------------------------------------------------
# APPLICATION DEFINITION
# ------------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",
    "hub_auth",
    "hub_users",
    "hub_groups",
    "hub_permissions",
    "hub_systems",
    "hub_calendars",
    "hub_academic",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

# ------------------------------------------------------------------------------
# TEMPLATES
# ------------------------------------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# ------------------------------------------------------------------------------
# DATABASE
# ------------------------------------------------------------------------------
if ENVIRONMENT == "prod":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("POSTGRES_DB", default="hub_sistemas_ifrs"),
            "USER": env("POSTGRES_USER", default="postgres"),
            "PASSWORD": env("POSTGRES_PASSWORD", default="postgres"),
            "HOST": env("POSTGRES_HOST", default="db"),
            "PORT": env("POSTGRES_PORT", default="5432"),
        }
    }
elif ENVIRONMENT == "dev":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    raise ValueError("ENVIRONMENT deve ser 'dev' ou 'prod'.")

# ------------------------------------------------------------------------------
# AUTH
# ------------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

AUTH_USER_MODEL = "hub_users.CustomUser"
FS_AUTH_SYSTEM_MODEL = "hub_systems.System"
SIMPLE_JWT = {
    "AUTH_COOKIE": env("AUTH_COOKIE_NAME", default="access_token"),
    "AUTH_COOKIE_REFRESH": env("REFRESH_COOKIE_NAME", default="refresh_token"),
}

# ------------------------------------------------------------------------------
# I18N
# ------------------------------------------------------------------------------
LANGUAGE_CODE = "pt-BR"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

LOCALE_PATHS = [BASE_DIR / "locale"]

# ------------------------------------------------------------------------------
# STATIC
# ------------------------------------------------------------------------------
STATIC_URL = "/static/"

# ------------------------------------------------------------------------------
# DEFAULT PK
# ------------------------------------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
