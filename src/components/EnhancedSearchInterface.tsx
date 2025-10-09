import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, MessageCircle, FileText, Brain, Loader2, Sparkles } from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { StoredDocument } from "@/services/documentStorage";

export const EnhancedSearchInterface = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    documents: StoredDocument[];
    answer: string;
  } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const { EnhancedDocumentService } = await import('@/services/enhancedDocumentService');
      const results = await EnhancedDocumentService.searchDocuments(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({
        documents: [],
        answer: 'Search failed. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const sampleQuestions = [
    "What are the latest safety protocols?",
    "Show me financial reports from this month",
    "What maintenance activities are scheduled?",
    "Are there any high priority documents?",
    "What are the current operational challenges?"
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Search Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Knowledge Search
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask questions in natural language and get intelligent answers from your document collection
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ask anything about your documents... (e.g., 'What are the safety requirements for platform work?')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                disabled={isSearching}
              />
            </div>
            <Button onClick={handleSearch} disabled={!query.trim() || isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Sample Questions */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setQuery(question)}
                  disabled={isSearching}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          {/* AI Answer */}
          {searchResults.answer && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  AI Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {searchResults.answer}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Related Documents */}
          {searchResults.documents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Related Documents</h3>
                <Badge variant="secondary">{searchResults.documents.length}</Badge>
              </div>
              <div className="space-y-4">
                {searchResults.documents.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchResults.documents.length === 0 && !searchResults.answer && (
            <Card className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try rephrasing your question or using different keywords
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!searchResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Natural Language Queries:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "What safety measures are required?"</li>
                  <li>• "Show me financial performance data"</li>
                  <li>• "When is the next maintenance due?"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Specific Searches:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Department names (Engineering, Finance)</li>
                  <li>• Document types (Safety, Reports, Policies)</li>
                  <li>• Priority levels (High, Medium, Low)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};