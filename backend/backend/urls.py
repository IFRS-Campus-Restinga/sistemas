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
from hub_users.views.login_django_admin import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('django-admin/', include('hub_users.urls')),

    # auth & session
    path('auth/', include('hub_users.urls')),
    path('session/', include('hub_users.urls')),

    # user, group & permission data
    path('api/user/', include('hub_users.urls')),
    path('api/group/', include('hub_groups.urls')),
    path('api/permission/', include('hub_permissions.urls')),

    # system data
    path('api/system/', include('hub_systems.urls')),

    # calendar & events data
    path('api/calendar/', include('hub_calendars.urls')),

    # academic data (courses, subjects, ppcs, classes)
    path('api/academic/', include('hub_academic.urls'))
]
