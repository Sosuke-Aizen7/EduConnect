
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import SavedCourse, Comparison
from .serializers import SavedCourseSerializer, ComparisonSerializer
from courses.models import Course
import json

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_profile(request):
    if request.user.is_authenticated:
        return Response({
            'id': str(request.user.id),
            'email': request.user.email,
            'name': request.user.first_name + ' ' + request.user.last_name if request.user.first_name else request.user.username,
            'profileImageUrl': None  # Add profile image logic if needed
        })
    return Response({'message': 'Unauthorized'}, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_user(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response({
                'id': str(user.id),
                'email': user.email,
                'name': user.first_name + ' ' + user.last_name if user.first_name else user.username,
            })
        return Response({'message': 'Invalid credentials'}, status=401)
    except Exception as e:
        return Response({'message': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_user(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_courses(request):
    saved_courses = SavedCourse.objects.filter(user=request.user).select_related('course', 'course__university')
    serializer = SavedCourseSerializer(saved_courses, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_course(request):
    course_id = request.data.get('course_id')
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
            return Response({'message': 'Course already saved'}, status=status.HTTP_200_OK)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_saved_course(request, course_id):
    try:
        saved_course = SavedCourse.objects.get(user=request.user, course_id=course_id)
        saved_course.delete()
        return Response({'message': 'Course removed from saved list'}, status=status.HTTP_200_OK)
    except SavedCourse.DoesNotExist:
        return Response({'error': 'Saved course not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_saved_course(request, course_id):
    is_saved = SavedCourse.objects.filter(user=request.user, course_id=course_id).exists()
    return Response({'is_saved': is_saved})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_comparisons(request):
    comparisons = Comparison.objects.filter(user=request.user)
    serializer = ComparisonSerializer(comparisons, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comparison(request):
    serializer = ComparisonSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comparison(request, comparison_id):
    try:
        comparison = Comparison.objects.get(id=comparison_id, user=request.user)
        comparison.delete()
        return Response({'message': 'Comparison deleted'}, status=status.HTTP_200_OK)
    except Comparison.DoesNotExist:
        return Response({'error': 'Comparison not found'}, status=status.HTTP_404_NOT_FOUND)
