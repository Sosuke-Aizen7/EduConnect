import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GraduationCap, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Universities", href: "/search?tab=universities" },
    { name: "Courses", href: "/search" },
    { name: "Compare", href: "/compare" },
    { name: "Resources", href: "/resources" },
  ];

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50" data-testid="header">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-primary-foreground text-lg" />
            </div>
            <span className="text-xl font-bold text-foreground">EduConnect</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`link-${item.name.toLowerCase()}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  className="hidden md:block"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-signin"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-getstarted"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-profile">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex flex-col items-start">
                    <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" data-testid="link-profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved" data-testid="link-saved">Saved Courses</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/compare" data-testid="link-comparisons">My Comparisons</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="button-logout"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`mobile-link-${item.name.toLowerCase()}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {!isAuthenticated && (
                    <>
                      <hr className="border-border my-4" />
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => window.location.href = "/api/login"}
                        data-testid="mobile-button-signin"
                      >
                        Sign In
                      </Button>
                      <Button
                        className="justify-start"
                        onClick={() => window.location.href = "/api/login"}
                        data-testid="mobile-button-getstarted"
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
