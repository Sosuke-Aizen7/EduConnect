
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    profile_image_url = models.URLField(blank=True, null=True)
    study_interest = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class SavedCourse(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='saved_courses')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'course']

class CourseComparison(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='comparisons')
    course_ids = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
