import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import CourseCard from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search as SearchIcon, Filter, SlidersHorizontal } from "lucide-react";
import { CourseWithUniversity } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export default function Search() {
  const [location, setLocation] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  
  // Search filters state
  const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');
  const [selectedCountry, setSelectedCountry] = useState(urlParams.get('country') || '');
  const [selectedLevel, setSelectedLevel] = useState(urlParams.get('level') || '');
  const [selectedSubject, setSelectedSubject] = useState(urlParams.get('subject') || '');
  const [selectedDuration, setSelectedDuration] = useState(urlParams.get('duration') || '');
  const [selectedFormat, setSelectedFormat] = useState(urlParams.get('format') || '');
  const [minFees, setMinFees] = useState(urlParams.get('minFees') || '');
  const [maxFees, setMaxFees] = useState(urlParams.get('maxFees') || '');
  const [sortBy, setSortBy] = useState(urlParams.get('sortBy') || 'relevance');
  const [currentPage, setCurrentPage] = useState(parseInt(urlParams.get('page') || '1'));
  const [showFilters, setShowFilters] = useState(false);
  
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  // Comparison state
  const [comparedCourses, setComparedCourses] = useState<number[]>([]);

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCountry && selectedCountry !== 'all') params.set('country', selectedCountry);
    if (selectedLevel && selectedLevel !== 'all') params.set('level', selectedLevel);
    if (selectedSubject && selectedSubject !== 'all') params.set('subject', selectedSubject);
    if (selectedDuration && selectedDuration !== 'all') params.set('duration', selectedDuration);
    if (selectedFormat && selectedFormat !== 'all') params.set('format', selectedFormat);
    if (minFees) params.set('minFees', minFees);
    if (maxFees) params.set('maxFees', maxFees);
    if (sortBy !== 'relevance') params.set('sortBy', sortBy);
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());
    return params.toString();
  };

  // Fetch courses
  const { data: courses = [], isLoading, error } = useQuery<CourseWithUniversity[]>({
    queryKey: ['/api/courses', buildQueryParams()],
    retry: false,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCountry && selectedCountry !== 'all') params.set('country', selectedCountry);
    if (selectedLevel && selectedLevel !== 'all') params.set('level', selectedLevel);
    if (selectedSubject && selectedSubject !== 'all') params.set('subject', selectedSubject);
    if (selectedDuration && selectedDuration !== 'all') params.set('duration', selectedDuration);
    if (selectedFormat && selectedFormat !== 'all') params.set('format', selectedFormat);
    if (minFees) params.set('minFees', minFees);
    if (maxFees) params.set('maxFees', maxFees);
    if (sortBy !== 'relevance') params.set('sortBy', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    if (location !== newUrl) {
      setLocation(newUrl);
    }
  }, [searchQuery, selectedCountry, selectedLevel, selectedSubject, selectedDuration, selectedFormat, minFees, maxFees, sortBy, currentPage]);

  const handleAddToComparison = (courseId: number) => {
    if (comparedCourses.includes(courseId)) {
      setComparedCourses(prev => prev.filter(id => id !== courseId));
    } else if (comparedCourses.length < 3) {
      setComparedCourses(prev => [...prev, courseId]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
    setSelectedLevel('all');
    setSelectedSubject('all');
    setSelectedDuration('all');
    setSelectedFormat('all');
    setMinFees('');
    setMaxFees('');
    setSortBy('relevance');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil((courses?.length || 0) > 0 ? 10 : 0); // Simplified pagination

  const countries = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Netherlands", "Switzerland"];
  const levels = ["Bachelor's", "Master's", "PhD", "Certificate"];
  const subjects = ["Computer Science", "Business", "Engineering", "Medicine", "Arts & Humanities", "Social Sciences"];
  const durations = ["6 months", "1 year", "2 years", "3+ years"];
  const formats = ["On-campus", "Online", "Hybrid"];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8" data-testid="search-header">
          <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="text-search-title">
            Find Your Perfect Course
          </h1>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="main-search">Search courses and universities</Label>
              <div className="relative">
                <Input
                  id="main-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by course name, university, or subject..."
                  className="pr-10"
                  data-testid="input-main-search"
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`} data-testid="filters-sidebar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    data-testid="button-clear-filters"
                  >
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Country Filter */}
                <div>
                  <Label className="text-sm font-medium">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger data-testid="select-filter-country">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Study Level Filter */}
                <div>
                  <Label className="text-sm font-medium">Study Level</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger data-testid="select-filter-level">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject Filter */}
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger data-testid="select-filter-subject">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Filter */}
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger data-testid="select-filter-duration">
                      <SelectValue placeholder="Any Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Duration</SelectItem>
                      {durations.map(duration => (
                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Format Filter */}
                <div>
                  <Label className="text-sm font-medium">Format</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger data-testid="select-filter-format">
                      <SelectValue placeholder="All Formats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      {formats.map(format => (
                        <SelectItem key={format} value={format}>{format}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tuition Range */}
                <div>
                  <Label className="text-sm font-medium">Tuition Range (USD)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minFees}
                      onChange={(e) => setMinFees(e.target.value)}
                      data-testid="input-min-fees"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxFees}
                      onChange={(e) => setMaxFees(e.target.value)}
                      data-testid="input-max-fees"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3" data-testid="results-section">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-muted-foreground" data-testid="text-results-count">
                {isLoading ? "Searching..." : `${courses.length} courses found`}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="fees_low">Tuition: Low to High</SelectItem>
                  <SelectItem value="fees_high">Tuition: High to Low</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedCountry || selectedLevel || selectedSubject || selectedDuration || selectedFormat || minFees || maxFees) && (
              <div className="mb-6" data-testid="active-filters">
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-foreground">×</button>
                    </Badge>
                  )}
                  {selectedCountry && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Country: {selectedCountry}
                      <button onClick={() => setSelectedCountry('')} className="ml-1 hover:text-foreground">×</button>
                    </Badge>
                  )}
                  {selectedLevel && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Level: {selectedLevel}
                      <button onClick={() => setSelectedLevel('')} className="ml-1 hover:text-foreground">×</button>
                    </Badge>
                  )}
                  {selectedSubject && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Subject: {selectedSubject}
                      <button onClick={() => setSelectedSubject('')} className="ml-1 hover:text-foreground">×</button>
                    </Badge>
                  )}
                  {selectedDuration && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Duration: {selectedDuration}
                      <button onClick={() => setSelectedDuration('')} className="ml-1 hover:text-foreground">×</button>
                    </Badge>
                  )}
                  {selectedFormat && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Format: {selectedFormat}
                      <button onClick={() => setSelectedFormat('')} className="ml-1 hover:text-foreground">×</button>
                    </Badge>
                  )}
                  {(minFees || maxFees) && (
                    <Badge variant="secondary" className="flex items-center gap-2">
                      Tuition: {minFees && `$${minFees}+`} {maxFees && `- $${maxFees}`}
                      <button onClick={() => { setMinFees(''); setMaxFees(''); }} className="ml-1 hover:text-foreground">×</button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Comparison Bar */}
            {comparedCourses.length > 0 && (
              <Card className="mb-6 border-primary" data-testid="comparison-bar">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Comparing {comparedCourses.length} course{comparedCourses.length > 1 ? 's' : ''}</span>
                      <Badge variant="outline">{comparedCourses.length}/3</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setComparedCourses([])}
                        data-testid="button-clear-comparison"
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        disabled={comparedCourses.length < 2}
                        onClick={() => setLocation(`/compare?courses=${comparedCourses.join(',')}`)}
                        data-testid="button-view-comparison"
                      >
                        Compare Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            ) : error ? (
              <Card className="p-8 text-center" data-testid="error-message">
                <h3 className="text-lg font-semibold text-foreground mb-2">Search Error</h3>
                <p className="text-muted-foreground">
                  Unable to load courses. Please try again later.
                </p>
              </Card>
            ) : courses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onAddToComparison={handleAddToComparison}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center" data-testid="pagination">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const page = i + 1;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-8 text-center" data-testid="no-results-message">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search filters or search terms.
                </p>
                <Button variant="outline" onClick={handleClearFilters} data-testid="button-clear-filters-no-results">
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
