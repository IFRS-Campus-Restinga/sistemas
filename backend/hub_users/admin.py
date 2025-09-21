from django.contrib import admin
from django.contrib.auth.models import Permission
from hub_users.models import *

admin.site.register(CustomUser)
admin.site.register(AdditionalInfos)
admin.site.register(Permission)
admin.site.register(Password)
# Register your models here.
