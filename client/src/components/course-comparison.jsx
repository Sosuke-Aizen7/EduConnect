
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function CourseComparison({ 
  courses, 
  onRemoveCourse, 
  onClearAll,
  maxCourses = 3 
}) {
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
      getValue: (course) => course.university.name 
    },
    { 
      label: "Location", 
      getValue: (course) => `${course.university.city}, ${course.university.country}` 
    },
    { 
      label: "Duration", 
      getValue: (course) => course.duration 
    },
    { 
      label: "Total Tuition", 
      getValue: (course) => formatFees(course.fees, course.feesType) 
    },
    { 
      label: "Format", 
      getValue: (course) => course.format 
    },
    { 
      label: "Credits", 
      getValue: (course) => course.credits ? `${course.credits} credits` : "N/A" 
    },
    { 
      label: "Application Deadline", 
      getValue: (course) => 
        course.applicationDeadline 
          ? new Date(course.applicationDeadline).toLocaleDateString()
          : "Rolling admissions" 
    },
    { 
      label: "Start Date", 
      getValue: (course) => 
        course.startDate 
          ? new Date(course.startDate).toLocaleDateString()
          : "Multiple start dates" 
    },
    { 
      label: "Rating", 
      getValue: (course) => course.rating ? `${course.rating}/5.0` : "N/A" 
    },
  ];

  if (courses.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-6" data-testid="course-comparison">
      {/* Comparison Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                Comparing {courses.length} course{courses.length > 1 ? 's' : ''}
              </span>
              <Badge variant="outline" data-testid="comparison-count">
                {courses.length}/{maxCourses}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
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
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="comparison-table">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground min-w-32">
                  Feature
                </th>
                {courses.map((course) => (
                  <th key={course.id} className="text-center p-4 min-w-64">
                    <div className="space-y-2">
                      <div className="relative">
                        <button
                          onClick={() => onRemoveCourse(course.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors z-10"
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
                {courses.length < maxCourses && (
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
                <tr key={index} className="border-b border-border">
                  <td className="p-4 font-medium text-muted-foreground">
                    {row.label}
                  </td>
                  {courses.map((course) => (
                    <td key={course.id} className="p-4 text-center" data-testid={`cell-${row.label.toLowerCase().replace(/\s+/g, '-')}-${course.id}`}>
                      {row.getValue(course)}
                    </td>
                  ))}
                  {courses.length < maxCourses && (
                    <td className="p-4 text-center text-muted-foreground">-</td>
                  )}
                </tr>
              ))}
              <tr>
                <td className="p-4 font-medium text-muted-foreground">
                  Actions
                </td>
                {courses.map((course) => (
                  <td key={course.id} className="p-4 text-center">
                    <div className="space-y-2">
                      <Button asChild size="sm" className="w-full" data-testid={`button-view-details-${course.id}`}>
                        <Link href={`/courses/${course.id}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
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
                {courses.length < maxCourses && (
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
            <CardTitle>Comparison Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Most Affordable */}
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Most Affordable</h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {courses.reduce((min, course) => {
                    const currentFees = parseFloat(course.fees || '999999');
                    const minFees = parseFloat(min.fees || '999999');
                    return currentFees < minFees ? course : min;
                  }).title}
                </p>
              </div>

              {/* Shortest Duration */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Shortest Duration</h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {courses.reduce((shortest, course) => {
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
  );
}
