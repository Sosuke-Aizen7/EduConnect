
from django.db import models

class University(models.Model):
    name = models.TextField()
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    ranking = models.IntegerField(blank=True, null=True)
    established = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Universities"
