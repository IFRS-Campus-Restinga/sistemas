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
from django.urls import path, include
from users.views.login_django_admin import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('django-admin/', include('users.urls')),

    # auth & session
    path('auth/', include('users.urls')),
    path('session/', include('users.urls')),

    # user, group & permission data
    path('api/user/', include('users.urls')),
    path('api/group/', include('groups.urls')),
    path('api/permission/', include('permissions.urls')),

    # system data
    path('api/system/', include('systems.urls')),

    # calendar & events data
    path('api/calendar/', include('calendars.urls')),
]
