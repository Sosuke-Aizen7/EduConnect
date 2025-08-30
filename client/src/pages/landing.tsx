import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import CourseCard from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Globe, Star } from "lucide-react";
import { Link } from "wouter";
import { CourseWithUniversity } from "@shared/schema";

export default function Landing() {
  const { data: popularCourses, isLoading } = useQuery<CourseWithUniversity[]>({
    queryKey: ['/api/courses/popular'],
    retry: false,
  });

  const stats = [
    { value: "2,500+", label: "Universities", testId: "stat-universities" },
    { value: "50,000+", label: "Courses", testId: "stat-courses" },
    { value: "150+", label: "Countries", testId: "stat-countries" },
    { value: "1M+", label: "Students Helped", testId: "stat-students" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Information",
      description: "All course and university data is verified and updated regularly to ensure accuracy.",
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Get personalized recommendations from our team of education counselors.",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Access to universities and programs across 150+ countries worldwide.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      program: "MS Computer Science, MIT",
      content: "EduConnect made finding the right program so much easier. The comparison feature saved me weeks of research!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c108?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      name: "Michael Rodriguez",
      program: "MBA, Wharton",
      content: "The detailed course information and application tracking features are fantastic. Highly recommended!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      name: "Emma Thompson",
      program: "PhD Psychology, Oxford",
      content: "Found my dream program in just two weeks. The platform is intuitive and comprehensive.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <HeroSection />

      {/* Stats Section */}
      <section className="py-16 bg-muted" data-testid="stats-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2" data-testid={stat.testId}>
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20" data-testid="featured-courses-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-featured-title">
              Featured Programs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-featured-description">
              Explore top-rated courses from world-renowned institutions
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground" data-testid="text-no-courses">
                No featured courses available at the moment.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild variant="secondary" size="lg" data-testid="button-view-all-courses">
              <Link href="/search">
                View All Courses
                <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-muted" data-testid="trust-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-trust-title">
              Trusted by Students Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-trust-description">
              Join thousands of students who found their perfect educational match
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-lg" data-testid={`card-feature-${index}`}>
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="text-primary text-2xl h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Student Testimonials */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-foreground text-center mb-8" data-testid="text-testimonials-title">
              What Students Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="shadow-lg" data-testid={`card-testimonial-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex text-accent">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="font-medium text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.program}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16" data-testid="footer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="text-primary-foreground text-lg h-5 w-5" />
                </div>
                <span className="text-xl font-bold">EduConnect</span>
              </div>
              <p className="text-background/80 leading-relaxed">
                Your trusted partner in finding the perfect educational opportunities worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <div className="space-y-3 text-background/80">
                <Link href="/search" className="block hover:text-background transition-colors">Universities</Link>
                <Link href="/search" className="block hover:text-background transition-colors">Courses</Link>
                <Link href="/scholarships" className="block hover:text-background transition-colors">Scholarships</Link>
                <Link href="/resources" className="block hover:text-background transition-colors">Student Resources</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-3 text-background/80">
                <Link href="/help" className="block hover:text-background transition-colors">Help Center</Link>
                <Link href="/contact" className="block hover:text-background transition-colors">Contact Us</Link>
                <Link href="/guide" className="block hover:text-background transition-colors">Application Guide</Link>
                <Link href="/blog" className="block hover:text-background transition-colors">Blog</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-3 text-background/80">
                <Link href="/privacy" className="block hover:text-background transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block hover:text-background transition-colors">Terms of Service</Link>
                <Link href="/cookies" className="block hover:text-background transition-colors">Cookie Policy</Link>
                <Link href="/accessibility" className="block hover:text-background transition-colors">Accessibility</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-background/20 mt-12 pt-8 text-center text-background/60">
            <p>&copy; 2024 EduConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
