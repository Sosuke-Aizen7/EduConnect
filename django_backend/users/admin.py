
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, SavedCourse, CourseComparison

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_staff', 'created_at']
    list_filter = ['is_staff', 'is_superuser', 'created_at']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']

@admin.register(SavedCourse)
class SavedCourseAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'created_at']
    list_filter = ['created_at']

@admin.register(CourseComparison)
class CourseComparisonAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    list_filter = ['created_at']
