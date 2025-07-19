from django.contrib import admin
from .models.class_model import Class
from .models.course import Course
from .models.ppc import PPC
from .models.subject import Subject

# Register your models here.
admin.site.register(Class)
admin.site.register(Course)
admin.site.register(PPC)
admin.site.register(Subject)
