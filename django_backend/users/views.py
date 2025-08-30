
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from .models import CustomUser, SavedCourse, CourseComparison
from .serializers import UserSerializer, SavedCourseSerializer, CourseComparisonSerializer
from courses.models import Course

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_courses(request):
    saved_courses = SavedCourse.objects.filter(user=request.user).select_related('course')
    serializer = SavedCourseSerializer(saved_courses, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_course(request):
    course_id = request.data.get('courseId')
    try:
        course = Course.objects.get(id=course_id)
        saved_course, created = SavedCourse.objects.get_or_create(
            user=request.user,
            course=course
        )
        if created:
            serializer = SavedCourseSerializer(saved_course)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Course already saved'}, status=status.HTTP_400_BAD_REQUEST)
    except Course.DoesNotExist:
        return Response({'message': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_saved_course(request, course_id):
    try:
        saved_course = SavedCourse.objects.get(user=request.user, course_id=course_id)
        saved_course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except SavedCourse.DoesNotExist:
        return Response({'message': 'Saved course not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_saved_course(request, course_id):
    is_wishlisted = SavedCourse.objects.filter(user=request.user, course_id=course_id).exists()
    return Response({'isWishlisted': is_wishlisted})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_comparisons(request):
    comparisons = CourseComparison.objects.filter(user=request.user)
    serializer = CourseComparisonSerializer(comparisons, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comparison(request):
    course_ids = request.data.get('courseIds', [])
    comparison = CourseComparison.objects.create(
        user=request.user,
        course_ids=course_ids
    )
    serializer = CourseComparisonSerializer(comparison)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comparison(request, comparison_id):
    try:
        comparison = CourseComparison.objects.get(id=comparison_id, user=request.user)
        comparison.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except CourseComparison.DoesNotExist:
        return Response({'message': 'Comparison not found'}, status=status.HTTP_404_NOT_FOUND)
