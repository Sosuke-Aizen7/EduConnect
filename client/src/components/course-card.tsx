import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Clock, Users, Star } from "lucide-react";
import { CourseWithUniversity } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CourseCardProps {
  course: CourseWithUniversity;
  onAddToComparison?: (courseId: number) => void;
}

export default function CourseCard({ course, onAddToComparison }: CourseCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if course is wishlisted
  const { data: wishlistData } = useQuery({
    queryKey: ['/api/saved-courses', course.id, 'check'],
    enabled: isAuthenticated,
    retry: false,
  });

  const isWishlisted = wishlistData?.isWishlisted || false;

  // Save/unsave course mutation
  const saveCourseMutation = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await apiRequest("DELETE", `/api/saved-courses/${course.id}`);
      } else {
        await apiRequest("POST", "/api/saved-courses", { courseId: course.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-courses', course.id, 'check'] });
      toast({
        title: isWishlisted ? "Course removed from saved" : "Course saved",
        description: isWishlisted 
          ? "The course has been removed from your saved courses." 
          : "The course has been added to your saved courses.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update saved courses. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save courses.",
        variant: "destructive",
      });
      return;
    }
    saveCourseMutation.mutate();
  };

  const formatFees = (fees: string | null, feesType: string | null) => {
    if (!fees) return "Contact for pricing";
    const amount = parseFloat(fees);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    
    const typeMap: Record<string, string> = {
      total: '/total',
      yearly: '/year',
      monthly: '/month',
    };
    
    return `${formatted}${typeMap[feesType || 'total'] || ''}`;
  };

  const getLevelColor = (level: string) => {
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

  return (
    <Card className="hover:shadow-xl transition-shadow overflow-hidden border border-border" data-testid={`card-course-${course.id}`}>
      <div className="aspect-video relative overflow-hidden">
        <img
          src={course.imageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
          alt={course.title}
          className="w-full h-full object-cover"
          data-testid={`img-course-${course.id}`}
        />
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Badge className={`${getLevelColor(course.level)} font-medium`} data-testid={`badge-level-${course.id}`}>
            {course.level}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleWishlistToggle}
            disabled={saveCourseMutation.isPending}
            className="h-8 w-8"
            data-testid={`button-wishlist-${course.id}`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
          </Button>
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-title-${course.id}`}>
          {course.title}
        </h3>
        <p className="text-muted-foreground mb-4" data-testid={`text-university-${course.id}`}>
          {course.university.name}
        </p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 mr-2" />
          <span data-testid={`text-location-${course.id}`}>
            {course.university.city}, {course.university.country}
          </span>
          <span className="mx-2">•</span>
          <Clock className="h-4 w-4 mr-2" />
          <span data-testid={`text-duration-${course.id}`}>{course.duration}</span>
        </div>

        {course.format && (
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Users className="h-4 w-4 mr-2" />
            <span data-testid={`text-format-${course.id}`}>{course.format}</span>
            {course.rating && (
              <>
                <span className="mx-2">•</span>
                <Star className="h-4 w-4 mr-1 text-accent" />
                <span data-testid={`text-rating-${course.id}`}>{course.rating}</span>
              </>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-foreground" data-testid={`text-fees-${course.id}`}>
              {formatFees(course.fees, course.feesType)}
            </span>
          </div>
          <div className="flex space-x-2">
            {onAddToComparison && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddToComparison(course.id)}
                data-testid={`button-compare-${course.id}`}
              >
                Compare
              </Button>
            )}
            <Button asChild size="sm" data-testid={`button-details-${course.id}`}>
              <Link href={`/courses/${course.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
