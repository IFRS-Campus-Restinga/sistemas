from django.urls import path
from .views.course_views import *
from .views.subject_views import *
from .views.ppc_views import *
from .views.course_class_views import *

urlpatterns = [
    # course views
    path('courses/create/', create_course),
    path('courses/get/', list_course),
    path('courses/get/<str:course_id>/', get_course),
    path('courses/get/<str:course_id>/subjects/', get_subjects_by_course),
    path('courses/edit/<str:course_id>/', edit_course),
    path('courses/classes/delete/<str:class_id>/', delete_course_class),

    # subject views
    path('subjects/create/', create_subject),
    path('subjects/get/', list_subject),
    path('subjects/get/<str:subject_id>/', get_subject),
    path('subjects/edit/<str:subject_id>/', edit_subject),

    # ppc views
    path('ppcs/create/', create_ppc),
    path('ppcs/get/', list_ppc),
    path('ppcs/get/<str:ppc_id>/', get_ppc),
    path('ppcs/edit/<str:ppc_id>/', edit_ppc),
    path('ppcs/delete/<str:ppc_id>/period/<int:period>/', delete_period_from),
    path('ppcs/delete/<str:ppc_id>/subjects/<str:subject_id>/', delete_subject_from),
    path('ppcs/delete/<str:ppc_id>/subjects/<str:subject_id>/pre_reqs/<str:pre_req_id>/', delete_pre_requisit_from),
]
