import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import CourseCard from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { CourseWithUniversity } from "@shared/schema";
import { Link } from "wouter";
import { BookOpen, Search, Heart, BarChart3 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: savedCourses, isLoading: savedLoading } = useQuery<CourseWithUniversity[]>({
    queryKey: ['/api/saved-courses'],
    retry: false,
  });

  const { data: popularCourses, isLoading: popularLoading } = useQuery<CourseWithUniversity[]>({
    queryKey: ['/api/courses/popular'],
    retry: false,
  });

  const quickActions = [
    {
      icon: Search,
      title: "Search Courses",
      description: "Find your perfect course from thousands of options",
      href: "/search",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Heart,
      title: "Saved Courses",
      description: "View and manage your saved courses",
      href: "/saved",
      color: "bg-destructive/10 text-destructive",
    },
    {
      icon: BarChart3,
      title: "Compare Programs",
      description: "Compare different courses side by side",
      href: "/compare",
      color: "bg-accent/10 text-accent-foreground",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-12" data-testid="welcome-section">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-welcome-title">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-xl text-muted-foreground mb-6" data-testid="text-welcome-description">
              Continue your educational journey. Discover new courses or manage your saved programs.
            </p>
            <Button asChild size="lg" data-testid="button-explore-courses">
              <Link href="/search">
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Courses
              </Link>
            </Button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12" data-testid="quick-actions-section">
          <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-quick-actions-title">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-action-${index}`}>
                <Link href={action.href}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
                    <p className="text-muted-foreground text-sm">{action.description}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Saved Courses Section */}
        <section className="mb-12" data-testid="saved-courses-section">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-saved-courses-title">
              Your Saved Courses
            </h2>
            <Button variant="outline" asChild data-testid="button-view-all-saved">
              <Link href="/saved">View All</Link>
            </Button>
          </div>

          {savedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-xl h-64 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : savedCourses && savedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCourses.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center" data-testid="card-no-saved-courses">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Saved Courses Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start exploring courses and save the ones you're interested in.
              </p>
              <Button asChild data-testid="button-start-exploring">
                <Link href="/search">Start Exploring</Link>
              </Button>
            </Card>
          )}
        </section>

        {/* Recommended for You */}
        <section className="mb-12" data-testid="recommended-section">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-recommended-title">
              Recommended for You
            </h2>
            <Button variant="outline" asChild data-testid="button-view-all-recommended">
              <Link href="/search">View All</Link>
            </Button>
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-xl h-64 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : popularCourses && popularCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCourses.slice(0, 3).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground" data-testid="text-no-recommended">
                No recommendations available at the moment.
              </p>
            </div>
          )}
        </section>

        {/* Study Interest Banner */}
        {user?.studyInterest && (
          <section className="mb-12" data-testid="study-interest-section">
            <Card className="bg-gradient-to-r from-accent/10 to-primary/10">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-study-interest-title">
                  Interested in {user.studyInterest}?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Discover specialized programs and courses in your field of interest.
                </p>
                <Button asChild data-testid="button-explore-interest">
                  <Link href={`/search?subject=${encodeURIComponent(user.studyInterest)}`}>
                    Explore {user.studyInterest} Programs
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
