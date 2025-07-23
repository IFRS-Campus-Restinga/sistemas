from django.contrib import admin
from .models.class_model import CourseClass
from .models.course import Course
from .models.ppc import PPC
from .models.subject import Subject

# Register your models here.
admin.site.register(CourseClass)
admin.site.register(Course)
admin.site.register(PPC)
admin.site.register(Subject)
