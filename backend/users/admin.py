from django.contrib import admin
from django.contrib.auth.models import Permission
from users.models import *

admin.site.register(CustomUser)
admin.site.register(Permission)
admin.site.register(Password)
# Register your models here.
