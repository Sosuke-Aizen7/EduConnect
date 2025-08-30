
from rest_framework import generics, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Course
from .serializers import CourseSerializer, CourseListSerializer

class CourseFilter(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        search = request.query_params.get('search')
        country = request.query_params.get('country')
        level = request.query_params.get('level')
        subject = request.query_params.get('subject')
        duration = request.query_params.get('duration')
        min_fees = request.query_params.get('minFees')
        max_fees = request.query_params.get('maxFees')
        format_type = request.query_params.get('format')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(subject__icontains=search) |
                Q(university__name__icontains=search)
            )
        
        if country:
            queryset = queryset.filter(university__country=country)
        
        if level:
            queryset = queryset.filter(level=level)
        
        if subject:
            queryset = queryset.filter(subject__icontains=subject)
        
        if duration:
            queryset = queryset.filter(duration__icontains=duration)
        
        if format_type:
            queryset = queryset.filter(format=format_type)
        
        if min_fees:
            queryset = queryset.filter(fees__gte=float(min_fees))
        
        if max_fees:
            queryset = queryset.filter(fees__lte=float(max_fees))

        return queryset

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.select_related('university').all()
    serializer_class = CourseListSerializer
    filter_backends = [CourseFilter, filters.OrderingFilter]
    ordering_fields = ['fees', 'rating', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseSerializer
        return CourseListSerializer

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.select_related('university').all()
    serializer_class = CourseSerializer

@api_view(['GET'])
def get_popular_courses(request):
    limit = int(request.query_params.get('limit', 6))
    courses = Course.objects.select_related('university').order_by('-rating', '-created_at')[:limit]
    serializer = CourseListSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def compare_courses(request):
    course_ids = request.data.get('courseIds', [])
    courses = Course.objects.filter(id__in=course_ids).select_related('university')
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)
