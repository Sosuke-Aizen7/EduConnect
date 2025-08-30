import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  Search, 
  Heart, 
  BarChart3, 
  User, 
  LogOut, 
  BookOpen,
  GraduationCap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MobileMenuProps {
  className?: string;
}

export default function MobileMenu({ className = "" }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Search Courses", href: "/search", icon: Search },
    { name: "Universities", href: "/search?tab=universities", icon: GraduationCap },
    { name: "Compare", href: "/compare", icon: BarChart3 },
    { name: "Resources", href: "/resources", icon: BookOpen },
  ];

  const userNavigation = [
    { name: "Saved Courses", href: "/saved", icon: Heart },
    { name: "My Comparisons", href: "/compare", icon: BarChart3 },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    window.location.href = "/api/logout";
  };

  const handleLogin = () => {
    setIsOpen(false);
    window.location.href = "/api/login";
  };

  return (
    <div className={className}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80" data-testid="mobile-menu-content">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-left">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-primary-foreground h-5 w-5" />
              </div>
              EduConnect
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full mt-6">
            {/* User Section */}
            {isAuthenticated && user && (
              <div className="mb-6" data-testid="mobile-menu-user-section">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || ""} />
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <nav className="flex-1 space-y-2" data-testid="mobile-menu-navigation">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                      location === item.href 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid={`mobile-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* User-specific Navigation */}
              {isAuthenticated && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      My Account
                    </div>
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                          location === item.href 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        data-testid={`mobile-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </nav>

            {/* Auth Actions */}
            <div className="mt-auto pt-4 border-t border-border" data-testid="mobile-menu-auth-section">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm font-medium"
                  onClick={handleLogout}
                  data-testid="mobile-button-logout"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogin}
                    data-testid="mobile-button-signin"
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleLogin}
                    data-testid="mobile-button-getstarted"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground text-center">
                © 2024 EduConnect. All rights reserved.
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
