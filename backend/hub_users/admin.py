from django.contrib import admin
from django.contrib.auth.models import Permission
from hub_users.models import *

admin.site.register(User)
admin.site.register(PersonalInfos)
admin.site.register(AccountInfos)
admin.site.register(BindRequest)
admin.site.register(Permission)
admin.site.register(Password)
# Register your models here.
