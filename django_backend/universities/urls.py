
from django.urls import path
from . import views

urlpatterns = [
    path('universities/', views.UniversityListCreateView.as_view(), name='university-list-create'),
    path('universities/<int:pk>/', views.UniversityDetailView.as_view(), name='university-detail'),
]
