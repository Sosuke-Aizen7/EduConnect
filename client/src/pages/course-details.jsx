
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  Share2, 
  ExternalLink,
  CheckCircle,
  Calendar,
  DollarSign,
  BookOpen,
  Award,
  Building
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";

export default function CourseDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch course details
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['/api/courses', id],
    retry: false,
  });

  // Check if course is wishlisted
  const { data: wishlistData } = useQuery({
    queryKey: ['/api/saved-courses', id, 'check'],
    enabled: isAuthenticated && !!id,
    retry: false,
  });

  const isWishlisted = wishlistData?.isWishlisted || false;

  // Save/unsave course mutation
  const saveCourseMutation = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await apiRequest("DELETE", `/api/saved-courses/${id}`);
      } else {
        await apiRequest("POST", "/api/saved-courses", { courseId: parseInt(id) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-courses', id, 'check'] });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center" data-testid="error-message">
            <h3 className="text-lg font-semibold text-foreground mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild data-testid="button-back-to-search">
              <Link href="/search">Back to Search</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8" data-testid="course-details-page">
        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="aspect-video md:aspect-[3/1] relative overflow-hidden rounded-xl">
            <img
              src={course.imageUrl || course.university.imageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400"}
              alt={course.title}
              className="w-full h-full object-cover"
              data-testid="img-course-hero"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getLevelColor(course.level)} text-white bg-white/20`} data-testid="badge-course-level">
                  {course.level}
                </Badge>
                {course.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium" data-testid="text-course-rating">{course.rating}</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-course-title">
                {course.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span data-testid="text-university-name">{course.university.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span data-testid="text-course-location">
                    {course.university.city}, {course.university.country}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Overview */}
            <Card data-testid="card-course-overview">
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-course-description">
                  {course.description || "This comprehensive program provides students with in-depth knowledge and practical skills in their chosen field of study. The curriculum is designed to meet industry standards and prepare graduates for successful careers."}
                </p>
              </CardContent>
            </Card>

            {/* Course Details Tabs */}
            <Tabs defaultValue="structure" className="w-full" data-testid="tabs-course-details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="structure">Course Structure</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="university">University Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="structure" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Program Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.courseStructure ? (
                      <div className="space-y-4">
                        {/* Render course structure from JSON */}
                        <div className="text-muted-foreground">
                          Course structure details will be displayed here based on the program curriculum.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border border-border rounded-lg p-4">
                          <div className="font-medium text-foreground mb-2">Foundation Courses</div>
                          <div className="text-sm text-muted-foreground">
                            Core subjects that provide fundamental knowledge and skills
                          </div>
                        </div>
                        <div className="border border-border rounded-lg p-4">
                          <div className="font-medium text-foreground mb-2">Specialization</div>
                          <div className="text-sm text-muted-foreground">
                            Advanced courses in your chosen area of focus
                          </div>
                        </div>
                        <div className="border border-border rounded-lg p-4">
                          <div className="font-medium text-foreground mb-2">Capstone Project</div>
                          <div className="text-sm text-muted-foreground">
                            Final project demonstrating mastery of skills and knowledge
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="requirements" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Admission Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.requirements ? (
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: course.requirements }} />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Relevant bachelor's degree or equivalent qualification</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>English language proficiency (IELTS/TOEFL for international students)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Letters of recommendation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Statement of purpose</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="university" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About {course.university.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {course.university.description || `${course.university.name} is a prestigious institution known for its academic excellence and research contributions. Located in ${course.university.city}, ${course.university.country}, the university offers a world-class education environment.`}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {course.university.established && (
                        <div>
                          <div className="font-medium text-foreground">Established</div>
                          <div className="text-muted-foreground">{course.university.established}</div>
                        </div>
                      )}
                      {course.university.ranking && (
                        <div>
                          <div className="font-medium text-foreground">Global Ranking</div>
                          <div className="text-muted-foreground">#{course.university.ranking}</div>
                        </div>
                      )}
                    </div>

                    {course.university.website && (
                      <Button variant="outline" asChild>
                        <a href={course.university.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit University Website
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <Card data-testid="card-quick-facts">
              <CardHeader>
                <CardTitle>Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium" data-testid="text-duration">{course.duration}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Cost:</span>
                  <span className="font-medium" data-testid="text-fees">
                    {formatFees(course.fees, course.feesType)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium" data-testid="text-format">{course.format}</span>
                </div>
                <Separator />
                {course.credits && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Credits:</span>
                      <span className="font-medium" data-testid="text-credits">{course.credits} credits</span>
                    </div>
                    <Separator />
                  </>
                )}
                {course.applicationDeadline && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Application Deadline:</span>
                      <span className="font-medium" data-testid="text-deadline">
                        {new Date(course.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                    <Separator />
                  </>
                )}
                {course.startDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium" data-testid="text-start-date">
                      {new Date(course.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.href = "/api/login";
                  } else {
                    toast({
                      title: "Application Started",
                      description: "You will be redirected to the application portal.",
                    });
                  }
                }}
                data-testid="button-apply-now"
              >
                <Award className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleWishlistToggle}
                disabled={saveCourseMutation.isPending}
                data-testid="button-save-course"
              >
                <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current text-destructive' : ''}`} />
                {isWishlisted ? 'Saved' : 'Save for Later'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  toast({
                    title: "Link copied",
                    description: "Course link has been copied to clipboard.",
                  });
                }}
                data-testid="button-share-course"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Course
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                asChild
                data-testid="button-add-to-comparison"
              >
                <Link href={`/compare?courses=${course.id}`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add to Comparison
                </Link>
              </Button>
            </div>

            {/* University Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Need More Information?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Contact the university directly for specific questions about this program.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:admissions@${course.university.name.toLowerCase().replace(/\s+/g, '')}.edu`}>
                    Contact Admissions
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
