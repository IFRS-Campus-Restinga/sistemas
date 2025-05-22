from django.contrib import admin
from google_auth.models import *

admin.site.register(CustomUser)
admin.site.register(Permission)
admin.site.register(Password)
# Register your models here.
