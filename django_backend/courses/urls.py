
from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.CourseListCreateView.as_view(), name='course-list-create'),
    path('courses/popular/', views.get_popular_courses, name='popular-courses'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('compare-courses/', views.compare_courses, name='compare-courses'),
]
