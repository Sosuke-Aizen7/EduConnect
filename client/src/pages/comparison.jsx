
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Plus, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Award,
  Star,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

export default function Comparison() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const [courseIds, setCourseIds] = useState([]);

  useEffect(() => {
    const coursesParam = urlParams.get('courses');
    if (coursesParam) {
      const ids = coursesParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      setCourseIds(ids);
    }
  }, [location]);

  // Fetch courses for comparison
  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['/api/compare-courses'],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const response = await fetch('/api/compare-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds }),
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: courseIds.length > 0,
    retry: false,
  });

  const removeCourse = (courseId) => {
    const newIds = courseIds.filter(id => id !== courseId);
    setCourseIds(newIds);
    
    // Update URL
    if (newIds.length > 0) {
      const newUrl = `/compare?courses=${newIds.join(',')}`;
      window.history.replaceState({}, '', newUrl);
    } else {
      window.history.replaceState({}, '', '/compare');
    }
  };

  const formatFees = (fees, feesType) => {
    if (!fees) return "Contact for pricing";
    const amount = parseFloat(fees);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    const typeMap = {
      total: '/total',
      yearly: '/year',
      monthly: '/month',
    };
    
    return `${formatted}${typeMap[feesType || 'total'] || ''}`;
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "bachelor's":
        return "bg-accent/20 text-accent-foreground";
      case "master's":
        return "bg-primary/10 text-primary";
      case "phd":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const comparisonRows = [
    { 
      label: "University", 
      key: "university", 
      icon: Award,
      getValue: (course) => course.university.name 
    },
    { 
      label: "Location", 
      key: "location", 
      icon: MapPin,
      getValue: (course) => `${course.university.city}, ${course.university.country}` 
    },
    { 
      label: "Duration", 
      key: "duration", 
      icon: Clock,
      getValue: (course) => course.duration 
    },
    { 
      label: "Total Tuition", 
      key: "fees", 
      icon: DollarSign,
      getValue: (course) => formatFees(course.fees, course.feesType) 
    },
    { 
      label: "Format", 
      key: "format", 
      icon: Users,
      getValue: (course) => course.format 
    },
    { 
      label: "Credits", 
      key: "credits", 
      icon: Award,
      getValue: (course) => course.credits ? `${course.credits} credits` : "N/A" 
    },
    { 
      label: "Application Deadline", 
      key: "deadline", 
      icon: Calendar,
      getValue: (course) => 
        course.applicationDeadline 
          ? new Date(course.applicationDeadline).toLocaleDateString()
          : "Rolling admissions" 
    },
    { 
      label: "Start Date", 
      key: "startDate", 
      icon: Calendar,
      getValue: (course) => 
        course.startDate 
          ? new Date(course.startDate).toLocaleDateString()
          : "Multiple start dates" 
    },
    { 
      label: "Rating", 
      key: "rating", 
      icon: Star,
      getValue: (course) => course.rating ? `${course.rating}/5.0` : "N/A" 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8" data-testid="comparison-page">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-comparison-title">
            Course Comparison
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl" data-testid="text-comparison-description">
            Compare courses side by side to make informed decisions about your educational journey.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-12 bg-muted rounded-lg mb-4"></div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        ) : error ? (
          <Card className="p-8 text-center" data-testid="error-message">
            <h3 className="text-lg font-semibold text-foreground mb-2">Comparison Error</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load course comparison. Please try again later.
            </p>
            <Button asChild data-testid="button-back-to-search">
              <Link href="/search">Back to Search</Link>
            </Button>
          </Card>
        ) : courses.length === 0 ? (
          <Card className="p-8 text-center" data-testid="empty-comparison">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Courses to Compare</h3>
            <p className="text-muted-foreground mb-4">
              Add courses to your comparison to see them side by side.
            </p>
            <Button asChild data-testid="button-find-courses">
              <Link href="/search">Find Courses to Compare</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Comparison Actions */}
            <Card data-testid="comparison-actions">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      Comparing {courses.length} course{courses.length > 1 ? 's' : ''}
                    </span>
                    <Badge variant="outline">{courses.length}/3</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCourseIds([]);
                        window.history.replaceState({}, '', '/compare');
                      }}
                      data-testid="button-clear-comparison"
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      data-testid="button-add-more-courses"
                    >
                      <Link href="/search">Add More Courses</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Table */}
            <Card className="overflow-hidden" data-testid="comparison-table">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground min-w-32">
                        Feature
                      </th>
                      {courses.map((course, index) => (
                        <th key={course.id} className="text-center p-4 min-w-64">
                          <div className="space-y-2">
                            <div className="relative">
                              <button
                                onClick={() => removeCourse(course.id)}
                                className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
                                data-testid={`button-remove-course-${course.id}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <img
                                src={course.imageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"}
                                alt={course.title}
                                className="w-full h-24 object-cover rounded-lg"
                                data-testid={`img-course-${course.id}`}
                              />
                            </div>
                            <Badge className={`${getLevelColor(course.level)} font-medium`}>
                              {course.level}
                            </Badge>
                            <div className="font-semibold text-foreground text-sm" data-testid={`text-course-title-${course.id}`}>
                              {course.title}
                            </div>
                          </div>
                        </th>
                      ))}
                      {courses.length < 3 && (
                        <th className="text-center p-4 min-w-64">
                          <Button
                            variant="outline"
                            className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors w-full h-32"
                            asChild
                            data-testid="button-add-course-slot"
                          >
                            <Link href="/search">
                              <div className="flex flex-col items-center">
                                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                <div className="text-sm text-muted-foreground">Add Course</div>
                              </div>
                            </Link>
                          </Button>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, index) => (
                      <tr key={row.key} className="border-b border-border">
                        <td className="p-4 font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <row.icon className="h-4 w-4" />
                            {row.label}
                          </div>
                        </td>
                        {courses.map((course) => (
                          <td key={course.id} className="p-4 text-center" data-testid={`cell-${row.key}-${course.id}`}>
                            {row.getValue(course)}
                          </td>
                        ))}
                        {courses.length < 3 && (
                          <td className="p-4 text-center text-muted-foreground">-</td>
                        )}
                      </tr>
                    ))}
                    <tr>
                      <td className="p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Actions
                        </div>
                      </td>
                      {courses.map((course) => (
                        <td key={course.id} className="p-4 text-center">
                          <div className="space-y-2">
                            <Button asChild size="sm" className="w-full" data-testid={`button-view-details-${course.id}`}>
                              <Link href={`/courses/${course.id}`}>
                                View Details
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                window.location.href = "/api/login";
                              }}
                              data-testid={`button-apply-${course.id}`}
                            >
                              Apply Now
                            </Button>
                          </div>
                        </td>
                      ))}
                      {courses.length < 3 && (
                        <td className="p-4 text-center text-muted-foreground">-</td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Comparison Summary */}
            {courses.length >= 2 && (
              <Card data-testid="comparison-summary">
                <CardHeader>
                  <CardTitle>Comparison Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Most Affordable */}
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Most Affordable</h4>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        {courses.reduce((min, course) => {
                          const currentFees = parseFloat(course.fees || '0');
                          const minFees = parseFloat(min.fees || '0');
                          return currentFees < minFees ? course : min;
                        }).title}
                      </p>
                    </div>

                    {/* Shortest Duration */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Shortest Duration</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {courses.reduce((shortest, course) => {
                          // Simple duration comparison - could be improved with proper parsing
                          return course.duration.length < shortest.duration.length ? course : shortest;
                        }).title}
                      </p>
                    </div>

                    {/* Highest Rated */}
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Highest Rated</h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        {courses.reduce((highest, course) => {
                          const currentRating = parseFloat(course.rating || '0');
                          const highestRating = parseFloat(highest.rating || '0');
                          return currentRating > highestRating ? course : highest;
                        }).title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
