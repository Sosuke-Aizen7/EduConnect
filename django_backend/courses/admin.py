
from django.contrib import admin
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'university', 'level', 'subject', 'fees', 'rating']
    list_filter = ['level', 'format', 'university__country']
    search_fields = ['title', 'subject', 'university__name']
    ordering = ['-created_at']
