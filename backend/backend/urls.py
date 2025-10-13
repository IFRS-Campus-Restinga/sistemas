"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
""" 
from django.contrib import admin
from django.urls import path, include, re_path
from hub_auth.views.login_django_admin import *
from django.views.generic import TemplateView
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('django-admin/', include('hub_auth.urls')),

    path('session/', include('hub_auth.urls')),

    path('api/users/', include('hub_users.urls')),
    path('api/groups/', include('hub_groups.urls')),
    path('api/permissions/', include('hub_permissions.urls')),
    path('api/systems/', include('hub_systems.urls')),
    path('api/calendars/', include('hub_calendars.urls')),
    path('api/academic/', include('hub_academic.urls')),
]

# serve arquivos estáticos do build do React
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])

# catch-all para o React (SPA)
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]