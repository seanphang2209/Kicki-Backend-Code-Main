import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useAskKicko, type AskRequest, type Suggestion } from "@/hooks/use-kicko-api";
import { 
  Bot, 
  Sparkles, 
  UtensilsCrossed, 
  MapPin, 
  ShoppingBag, 
  Calendar,
  History,
  Settings,
  Send,
  Lightbulb,
  Bookmark,
  Plus,
  X,
  AlertTriangle
} from "lucide-react";

const categories = [
  { id: "What to Eat", label: "What to Eat", icon: UtensilsCrossed, color: "orange" },
  { id: "Where to Go", label: "Where to Go", icon: MapPin, color: "blue" },
  { id: "What to Buy", label: "What to Buy", icon: ShoppingBag, color: "green" },
  { id: "What to Do", label: "What to Do", icon: Calendar, color: "purple" }
];

const colorClasses = {
  orange: "bg-orange-100 hover:bg-orange-200 text-orange-600",
  blue: "bg-blue-100 hover:bg-blue-200 text-blue-600",
  green: "bg-green-100 hover:bg-green-200 text-green-600",
  purple: "bg-purple-100 hover:bg-purple-200 text-purple-600"
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [userProfile, setUserProfile] = useState({
    diet: "",
    location: "",
    budget: ""
  });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { toast } = useToast();
  const askMutation = useAskKicko();

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !userInput.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a category and describe what you need.",
        variant: "destructive"
      });
      return;
    }

    const request: AskRequest = {
      category: selectedCategory,
      user_input: userInput.trim(),
      user_profile: {
        diet: userProfile.diet || undefined,
        location: userProfile.location || undefined,
        budget: userProfile.budget || undefined
      }
    };

    try {
      const response = await askMutation.mutateAsync(request);
      setSuggestions(response.suggestions);
      setShowResults(true);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearResults = () => {
    setShowResults(false);
    setSuggestions([]);
  };

  const newQuestion = () => {
    setSelectedCategory("");
    setUserInput("");
    setUserProfile({ diet: "", location: "", budget: "" });
    clearResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Kicko AI</h1>
                <p className="text-sm text-slate-500">Your intelligent assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <History className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">How can I help you today?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get personalized AI-powered suggestions tailored to your preferences and needs.
            </p>
          </div>

          {/* Quick Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant="outline"
                  className={`h-auto p-4 flex-col space-y-2 border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                    colorClasses[category.color as keyof typeof colorClasses]
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{category.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Main Input Form */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700 mb-2">
                    Category
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* User Input */}
                <div>
                  <Label htmlFor="userInput" className="text-sm font-medium text-slate-700 mb-2">
                    Tell me what you need
                  </Label>
                  <Textarea
                    id="userInput"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="I'm feeling tired and want something quick and healthy..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* User Profile Section */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <Settings className="text-blue-500 mr-2 w-5 h-5" />
                    Your Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="diet" className="text-sm font-medium text-slate-700 mb-2">
                        Diet
                      </Label>
                      <Select value={userProfile.diet} onValueChange={(value) => 
                        setUserProfile(prev => ({ ...prev, diet: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="keto">Keto</SelectItem>
                          <SelectItem value="paleo">Paleo</SelectItem>
                          <SelectItem value="gluten-free">Gluten-free</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-slate-700 mb-2">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={userProfile.location}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Singapore"
                      />
                    </div>
                    <div>
                      <Label htmlFor="budget" className="text-sm font-medium text-slate-700 mb-2">
                        Budget
                      </Label>
                      <Select value={userProfile.budget} onValueChange={(value) => 
                        setUserProfile(prev => ({ ...prev, budget: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="under $10">Under $10</SelectItem>
                          <SelectItem value="$10-25">$10 - $25</SelectItem>
                          <SelectItem value="$25-50">$25 - $50</SelectItem>
                          <SelectItem value="$50+">$50+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    disabled={askMutation.isPending}
                  >
                    {askMutation.isPending ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 w-4 h-4" />
                        <span>Get AI Suggestions</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Loading State */}
          {askMutation.isPending && (
            <Card className="shadow-sm">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center">
                  <Spinner size="lg" className="mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold text-slate-900">Thinking...</h3>
                  <p className="text-slate-600">Our AI is analyzing your request</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {askMutation.isError && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="text-red-400 w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
                    <p className="mt-1 text-sm text-red-600">
                      {askMutation.error instanceof Error 
                        ? askMutation.error.message 
                        : "Please check your input and try again."}
                    </p>
                  </div>
                  <div className="ml-auto pl-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-400 hover:text-red-600"
                      onClick={() => askMutation.reset()}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {showResults && suggestions.length > 0 && (
            <div id="results-section">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">AI Suggestions</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearResults}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Lightbulb className="text-emerald-600 w-5 h-5" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 text-lg mb-2">
                            {suggestion.title}
                          </h4>
                          <p className="text-slate-600 leading-relaxed">
                            {suggestion.reason}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-slate-400 hover:text-slate-600"
                            title="Save suggestion"
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* New Question Button */}
              <div className="text-center mt-8">
                <Button 
                  variant="outline"
                  onClick={newQuestion}
                  className="font-medium px-6 py-3"
                >
                  <Plus className="mr-2 w-4 h-4" />
                  Ask Another Question
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-slate-500 text-sm">Powered by Kicko AI • Built with modern web technologies</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
