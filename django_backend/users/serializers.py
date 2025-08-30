
from rest_framework import serializers
from .models import CustomUser, SavedCourse, CourseComparison

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_image_url', 'study_interest', 'created_at']

class SavedCourseSerializer(serializers.ModelSerializer):
    course = serializers.SerializerMethodField()

    class Meta:
        model = SavedCourse
        fields = ['id', 'course', 'created_at']

    def get_course(self, obj):
        from courses.serializers import CourseSerializer
        return CourseSerializer(obj.course).data

class CourseComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseComparison
        fields = ['id', 'course_ids', 'created_at']
