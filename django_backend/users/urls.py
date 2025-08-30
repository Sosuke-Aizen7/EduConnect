
from django.urls import path
from . import views

urlpatterns = [
    path('auth/user/', views.get_user_profile, name='user-profile'),
    path('saved-courses/', views.get_saved_courses, name='saved-courses'),
    path('saved-courses/', views.save_course, name='save-course'),
    path('saved-courses/<int:course_id>/', views.remove_saved_course, name='remove-saved-course'),
    path('saved-courses/<int:course_id>/check/', views.check_saved_course, name='check-saved-course'),
    path('comparisons/', views.get_comparisons, name='get-comparisons'),
    path('comparisons/', views.create_comparison, name='create-comparison'),
    path('comparisons/<int:comparison_id>/', views.delete_comparison, name='delete-comparison'),
]
