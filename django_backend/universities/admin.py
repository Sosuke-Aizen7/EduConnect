
from django.contrib import admin
from .models import University

@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'city', 'ranking', 'established']
    list_filter = ['country']
    search_fields = ['name', 'city']
    ordering = ['ranking']
