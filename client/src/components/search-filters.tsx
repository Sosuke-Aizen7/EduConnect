import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCountry: string;
  setSelectedCountry: (value: string) => void;
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedDuration: string;
  setSelectedDuration: (value: string) => void;
  selectedFormat: string;
  setSelectedFormat: (value: string) => void;
  minFees: string;
  setMinFees: (value: string) => void;
  maxFees: string;
  setMaxFees: (value: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  selectedCountry,
  setSelectedCountry,
  selectedLevel,
  setSelectedLevel,
  selectedSubject,
  setSelectedSubject,
  selectedDuration,
  setSelectedDuration,
  selectedFormat,
  setSelectedFormat,
  minFees,
  setMinFees,
  maxFees,
  setMaxFees,
  onClearFilters,
  className = "",
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "Netherlands", "Switzerland", "Sweden",
    "Norway", "Denmark", "Japan", "Singapore", "New Zealand"
  ];

  const levels = ["Bachelor's", "Master's", "PhD", "Certificate", "Diploma"];
  
  const subjects = [
    "Computer Science", "Business", "Engineering", "Medicine",
    "Arts & Humanities", "Social Sciences", "Natural Sciences",
    "Mathematics", "Psychology", "Law", "Education", "Architecture"
  ];
  
  const durations = ["6 months", "1 year", "2 years", "3 years", "4 years", "3+ years"];
  
  const formats = ["On-campus", "Online", "Hybrid", "Part-time", "Full-time"];

  const activeFiltersCount = [
    searchQuery, selectedCountry, selectedLevel, selectedSubject,
    selectedDuration, selectedFormat, minFees, maxFees
  ].filter(Boolean).length;

  const clearIndividualFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        setSearchQuery('');
        break;
      case 'country':
        setSelectedCountry('all');
        break;
      case 'level':
        setSelectedLevel('all');
        break;
      case 'subject':
        setSelectedSubject('all');
        break;
      case 'duration':
        setSelectedDuration('all');
        break;
      case 'format':
        setSelectedFormat('all');
        break;
      case 'fees':
        setMinFees('');
        setMaxFees('');
        break;
    }
  };

  return (
    <div className={`space-y-4 ${className}`} data-testid="search-filters">
      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                Active Filters ({activeFiltersCount})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                data-testid="button-clear-all-filters"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-filter-search">
                  Search: {searchQuery}
                  <button 
                    onClick={() => clearIndividualFilter('search')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCountry && (
                <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-filter-country">
                  {selectedCountry}
                  <button 
                    onClick={() => clearIndividualFilter('country')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedLevel && (
                <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-filter-level">
                  {selectedLevel}
                  <button 
                    onClick={() => clearIndividualFilter('level')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedSubject && (
                <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-filter-subject">
                  {selectedSubject}
                  <button 
                    onClick={() => clearIndividualFilter('subject')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedDuration && (
                <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-filter-duration">
                  {selectedDuration}
                  <button 
                    onClick={() => clearIndividualFilter('duration')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedFormat && (
                <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-filter-format">
                  {selectedFormat}
                  <button 
                    onClick={() => clearIndividualFilter('format')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(minFees || maxFees) && (
                <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-filter-fees">
                  Fees: {minFees && `$${minFees}+`} {maxFees && `- $${maxFees}`}
                  <button 
                    onClick={() => clearIndividualFilter('fees')}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search Filters</CardTitle>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-toggle-filters">
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Expand
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Always Visible Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country Filter */}
            <div className="space-y-2">
              <Label htmlFor="filter-country">Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger id="filter-country" data-testid="select-filter-country">
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
            <div className="space-y-2">
              <Label htmlFor="filter-level">Study Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger id="filter-level" data-testid="select-filter-level">
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
          </div>

          {/* Collapsible Advanced Filters */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent className="space-y-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filter-subject">Subject Area</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="filter-subject" data-testid="select-filter-subject">
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
                <div className="space-y-2">
                  <Label htmlFor="filter-duration">Duration</Label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger id="filter-duration" data-testid="select-filter-duration">
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
                <div className="space-y-2">
                  <Label htmlFor="filter-format">Study Format</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger id="filter-format" data-testid="select-filter-format">
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
              </div>

              {/* Tuition Range */}
              <div className="space-y-2">
                <Label>Tuition Range (USD)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="min-fees" className="text-xs text-muted-foreground">Minimum</Label>
                    <Input
                      id="min-fees"
                      type="number"
                      placeholder="0"
                      value={minFees}
                      onChange={(e) => setMinFees(e.target.value)}
                      data-testid="input-min-fees"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-fees" className="text-xs text-muted-foreground">Maximum</Label>
                    <Input
                      id="max-fees"
                      type="number"
                      placeholder="100000"
                      value={maxFees}
                      onChange={(e) => setMaxFees(e.target.value)}
                      data-testid="input-max-fees"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
