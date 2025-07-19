from django.urls import path
from .views.course_views import *
from .views.subject_views import *
from .views.ppc_views import *

urlpatterns = [
    # course views
    path('course/create/', create_course),
    path('course/get/', get_course),
    path('course/get/<str:course_id>/', list_course),
    path('course/edit/<str:course_id>/', edit_course),

    # subject views
    path('subject/create/', create_subject),
    path('subject/get/', get_subject),
    path('subject/get/<str:subject_id>/', list_subject),
    path('subject/edit/<str:subject_id>/', edit_subject),

    # ppc views
    path('ppc/create/', create_ppc),
    path('ppc/get/', get_ppc),
    path('ppc/get/<str:ppc_id>/', list_ppc),
    path('ppc/edit/<str:ppc_id>/', edit_ppc),
]
