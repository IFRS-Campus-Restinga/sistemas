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
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import FileResponse, Http404
from pathlib import Path

urlpatterns = [
    path('session/', include('hub_auth.urls')),

    path('api/users/', include('hub_users.urls')),
    path('api/groups/', include('hub_groups.urls')),
    path('api/permissions/', include('hub_permissions.urls')),
    path('api/systems/', include('hub_systems.urls')),
    path('api/calendars/', include('hub_calendars.urls')),
    path('api/academic/', include('hub_academic.urls')),
    re_path(
        r'^assets/(?P<path>.*)$',
        serve,
        {
            'document_root': (
                settings.STATICFILES_DIRS[0] if settings.STATICFILES_DIRS else Path(settings.BASE_DIR) / 'static'
            ) / 'assets'
        },
    ),
]

# serve arquivos estáticos do build do React
if settings.STATIC_URL:
    static_root = settings.STATICFILES_DIRS[0] if settings.STATICFILES_DIRS else Path(settings.BASE_DIR) / 'static'
    urlpatterns += static(settings.STATIC_URL, document_root=static_root)

# catch-all para o React (SPA)
def spa_index(_request):
    index_path = (settings.STATICFILES_DIRS[0] if settings.STATICFILES_DIRS else Path(settings.BASE_DIR) / 'static') / 'index.html'
    if not index_path.exists():
        raise Http404("index.html not found in static directory")
    return FileResponse(index_path.open('rb'), content_type='text/html')

urlpatterns += [
    re_path(r'^.*$', spa_index),
]
