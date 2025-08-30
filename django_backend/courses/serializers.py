
from rest_framework import serializers
from .models import Course
from universities.serializers import UniversitySerializer

class CourseSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    university_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Course
        fields = '__all__'

class CourseListSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'university', 'level', 'subject', 'duration', 'format', 'fees', 'fees_type', 'rating', 'image_url']
