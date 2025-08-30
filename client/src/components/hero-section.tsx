import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [studyLevel, setStudyLevel] = useState("");
  const [duration, setDuration] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCountry && selectedCountry !== "all") params.set("country", selectedCountry);
    if (studyLevel && studyLevel !== "all") params.set("level", studyLevel);
    if (duration && duration !== "all") params.set("duration", duration);

    setLocation(`/search?${params.toString()}`);
  };

  return (
    <section className="hero-gradient text-primary-foreground py-20" data-testid="hero-section">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
          Find Your Perfect <br />
          <span className="text-accent">Educational Journey</span>
        </h1>
        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto" data-testid="text-hero-description">
          Discover universities and courses worldwide. Compare programs, explore opportunities, and take the next step in your academic career.
        </p>
        
        {/* Search Interface */}
        <div className="bg-card rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto" data-testid="search-interface">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="search-subjects" className="text-sm font-medium text-muted-foreground">
                What do you want to study?
              </Label>
              <div className="relative">
                <Input
                  id="search-subjects"
                  type="text"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-subjects"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="select-country" className="text-sm font-medium text-muted-foreground">
                Country
              </Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger id="select-country" data-testid="select-country">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Netherlands">Netherlands</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="select-study-level" className="text-sm font-medium text-muted-foreground">
                Study Level
              </Label>
              <Select value={studyLevel} onValueChange={setStudyLevel}>
                <SelectTrigger id="select-study-level" data-testid="select-study-level">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                  <SelectItem value="Master's">Master's</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="select-duration" className="text-sm font-medium text-muted-foreground">
                Duration
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="select-duration" data-testid="select-duration">
                  <SelectValue placeholder="Any Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Duration</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="1 year">1 year</SelectItem>
                  <SelectItem value="2 years">2 years</SelectItem>
                  <SelectItem value="3+ years">3+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button
            onClick={handleSearch}
            className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-3 text-lg font-semibold hover:bg-primary/90"
            data-testid="button-search-courses"
          >
            <Search className="mr-2 h-5 w-5" />
            Search Courses
          </Button>
        </div>
      </div>
    </section>
  );
}
