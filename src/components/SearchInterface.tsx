import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar, FileText, Users, TrendingUp } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  department: string;
  date: string;
  relevance: number;
  source: string;
}

export const SearchInterface = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "Safety Protocol Update - Construction Zones",
      content: "All personnel working in construction zones must wear appropriate PPE including hard hats, safety vests, and steel-toed boots. Emergency evacuation procedures have been updated...",
      type: "Safety Document",
      department: "Engineering",
      date: "2024-01-15",
      relevance: 95,
      source: "safety-circular-2024-15.pdf"
    },
    {
      id: "2",
      title: "Revenue Analysis December 2023",
      content: "December showed significant growth with ₹2.4 crores total revenue, representing a 12% increase from November. Passenger count reached 1.2 million with improved peak hour efficiency...",
      type: "Financial Report",
      department: "Finance",
      date: "2024-01-10",
      relevance: 87,
      source: "revenue-report-dec-2023.xlsx"
    },
    {
      id: "3",
      title: "Corridor Expansion Environmental Clearance",
      content: "Environmental clearance has been approved for Phase 2 of the corridor expansion project. The clearance covers all proposed construction activities and mitigation measures...",
      type: "Project Document",
      department: "Engineering",
      date: "2024-01-08",
      relevance: 82,
      source: "env-clearance-phase2.pdf"
    }
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const popularSearches = [
    "Safety protocols",
    "Revenue reports",
    "Project updates",
    "Maintenance schedules",
    "Policy changes",
    "Environmental clearances"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Global Search</h2>
        <p className="text-muted-foreground">Search across all KMRL documents and data using natural language</p>
      </div>

      {/* Search Bar */}
      <Card className="p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything... e.g., 'What are the latest safety updates for Aluva station?'"
              className="pl-10 pr-4 py-2 text-base"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={!query.trim() || isSearching}
            className="px-6"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
          {["Safety", "Finance", "Engineering", "Projects", "Reports"].map((filter) => (
            <Badge
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"}
              className="cursor-pointer hover:bg-muted"
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>

        {/* Popular Searches */}
        {!results.length && !isSearching && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search) => (
                <Badge
                  key={search}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary-hover"
                  onClick={() => setQuery(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Search Results */}
      {isSearching && (
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Searching across all documents...</span>
            </div>
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Search Results ({results.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Sorted by relevance</span>
            </div>
          </div>

          {results.map((result) => (
            <Card key={result.id} className="p-4 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-foreground">{result.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(result.relevance)}% match
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(result.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <Users className="h-3 w-3" />
                    <span>{result.department}</span>
                    <span>•</span>
                    <span>{result.source}</span>
                  </div>
                </div>
                <Badge className="text-xs">
                  {result.type}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {result.content}
              </p>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Open Document
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full" 
                      style={{ width: `${result.relevance}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{result.relevance}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};