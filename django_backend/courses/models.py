
from django.db import models
from universities.models import University

class Course(models.Model):
    LEVEL_CHOICES = [
        ('Bachelor\'s', 'Bachelor\'s'),
        ('Master\'s', 'Master\'s'),
        ('PhD', 'PhD'),
        ('Certificate', 'Certificate'),
    ]
    
    FORMAT_CHOICES = [
        ('On-campus', 'On-campus'),
        ('Online', 'Online'),
        ('Hybrid', 'Hybrid'),
    ]
    
    FEES_TYPE_CHOICES = [
        ('total', 'Total'),
        ('yearly', 'Yearly'),
        ('monthly', 'Monthly'),
    ]

    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='courses')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    subject = models.CharField(max_length=200)
    duration = models.CharField(max_length=100)
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES)
    fees = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    fees_type = models.CharField(max_length=10, choices=FEES_TYPE_CHOICES, default='total')
    credits = models.IntegerField(blank=True, null=True)
    application_deadline = models.DateTimeField(blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    course_structure = models.JSONField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
