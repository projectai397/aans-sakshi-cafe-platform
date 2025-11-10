import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "article" | "product" | "program";
  division: string;
  category: string;
  rating: number;
  price?: number;
  date?: string;
  tags: string[];
}

const MOCK_RESULTS: SearchResult[] = [
  {
    id: "1",
    title: "Mindfulness Meditation for Beginners",
    description: "Learn the basics of meditation and reduce stress in just 10 minutes a day",
    type: "program",
    division: "Sakshi",
    category: "Wellness",
    rating: 4.8,
    tags: ["meditation", "wellness", "beginner"],
    date: "2025-01-15",
  },
  {
    id: "2",
    title: "Sustainable Fashion Guide",
    description: "Discover eco-friendly fashion choices and support sustainable creators",
    type: "article",
    division: "SubCircle",
    category: "Sustainability",
    rating: 4.5,
    tags: ["fashion", "sustainability", "eco-friendly"],
    date: "2025-01-10",
  },
  {
    id: "3",
    title: "Premium Handmade Leather Wallet",
    description: "Ethically sourced leather wallet crafted by local artisans",
    type: "product",
    division: "SubCircle",
    category: "Accessories",
    rating: 4.9,
    price: 1299,
    tags: ["leather", "handmade", "accessories"],
  },
  {
    id: "4",
    title: "Business Automation with AVE",
    description: "Streamline your business processes with AI-powered automation",
    type: "article",
    division: "AVE",
    category: "Business",
    rating: 4.7,
    tags: ["automation", "business", "ai"],
    date: "2025-01-12",
  },
  {
    id: "5",
    title: "Yoga and Flexibility Class",
    description: "Improve flexibility and strength with our expert yoga instructors",
    type: "program",
    division: "Sakshi",
    category: "Fitness",
    rating: 4.6,
    tags: ["yoga", "fitness", "flexibility"],
    date: "2025-01-14",
  },
  {
    id: "6",
    title: "Organic Cotton T-Shirt",
    description: "100% organic cotton, ethically produced t-shirt in multiple colors",
    type: "product",
    division: "SubCircle",
    category: "Clothing",
    rating: 4.4,
    price: 599,
    tags: ["organic", "cotton", "clothing"],
  },
  {
    id: "7",
    title: "Customer Service Excellence",
    description: "Master the art of exceptional customer service with AI assistance",
    type: "article",
    division: "AVE",
    category: "Customer Service",
    rating: 4.8,
    tags: ["customer-service", "ai", "training"],
    date: "2025-01-11",
  },
  {
    id: "8",
    title: "Nutrition and Wellness Workshop",
    description: "Learn about balanced nutrition and holistic wellness practices",
    type: "program",
    division: "Sakshi",
    category: "Nutrition",
    rating: 4.7,
    tags: ["nutrition", "wellness", "health"],
    date: "2025-01-13",
  },
];

const DIVISIONS = ["AVE", "Sakshi", "SubCircle"];
const CATEGORIES = ["Wellness", "Sustainability", "Accessories", "Business", "Fitness", "Clothing", "Customer Service", "Nutrition"];
const TYPES = ["article", "product", "program"];
const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { label: "Above ₹2000", min: 2000, max: Infinity },
];
const RATINGS = [
  { label: "4.5+ Stars", min: 4.5 },
  { label: "4.0+ Stars", min: 4.0 },
  { label: "3.5+ Stars", min: 3.5 },
];

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "price" | "date">("relevance");
  const [expandedFilters, setExpandedFilters] = useState<string[]>(["divisions"]);

  // Filter and search results
  const filteredResults = useMemo(() => {
    let results = MOCK_RESULTS;

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Division filter
    if (selectedDivisions.length > 0) {
      results = results.filter((r) => selectedDivisions.includes(r.division));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      results = results.filter((r) => selectedCategories.includes(r.category));
    }

    // Type filter
    if (selectedTypes.length > 0) {
      results = results.filter((r) => selectedTypes.includes(r.type));
    }

    // Price filter
    if (selectedPriceRange) {
      results = results.filter((r) => {
        if (!r.price) return false;
        return r.price >= selectedPriceRange.min && r.price <= selectedPriceRange.max;
      });
    }

    // Rating filter
    if (selectedRating) {
      results = results.filter((r) => r.rating >= selectedRating);
    }

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price":
          return (a.price || 0) - (b.price || 0);
        case "date":
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        default:
          return 0;
      }
    });

    return results;
  }, [searchQuery, selectedDivisions, selectedCategories, selectedTypes, selectedPriceRange, selectedRating, sortBy]);

  const toggleFilter = (filterName: string) => {
    setExpandedFilters((prev) =>
      prev.includes(filterName) ? prev.filter((f) => f !== filterName) : [...prev, filterName]
    );
  };

  const toggleDivision = (division: string) => {
    setSelectedDivisions((prev) =>
      prev.includes(division) ? prev.filter((d) => d !== division) : [...prev, division]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDivisions([]);
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setSortBy("relevance");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedDivisions.length > 0 ||
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    selectedPriceRange ||
    selectedRating;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Advanced Search</h1>
          <p className="text-muted-foreground">Find articles, products, and programs across all divisions</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, products, programs..."
              className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Filters</h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-cyan-500 hover:text-cyan-600">
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Divisions */}
                <div>
                  <button
                    onClick={() => toggleFilter("divisions")}
                    className="w-full flex items-center justify-between py-2 text-foreground font-semibold hover:text-cyan-500"
                  >
                    Divisions
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedFilters.includes("divisions") ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFilters.includes("divisions") && (
                    <div className="space-y-2 mt-2 pl-2">
                      {DIVISIONS.map((division) => (
                        <label key={division} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDivisions.includes(division)}
                            onChange={() => toggleDivision(division)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-muted-foreground">{division}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <button
                    onClick={() => toggleFilter("categories")}
                    className="w-full flex items-center justify-between py-2 text-foreground font-semibold hover:text-cyan-500"
                  >
                    Categories
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedFilters.includes("categories") ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFilters.includes("categories") && (
                    <div className="space-y-2 mt-2 pl-2 max-h-48 overflow-y-auto">
                      {CATEGORIES.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-muted-foreground">{category}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type */}
                <div>
                  <button
                    onClick={() => toggleFilter("types")}
                    className="w-full flex items-center justify-between py-2 text-foreground font-semibold hover:text-cyan-500"
                  >
                    Type
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedFilters.includes("types") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedFilters.includes("types") && (
                    <div className="space-y-2 mt-2 pl-2">
                      {TYPES.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => toggleType(type)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm text-muted-foreground capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div>
                  <button
                    onClick={() => toggleFilter("price")}
                    className="w-full flex items-center justify-between py-2 text-foreground font-semibold hover:text-cyan-500"
                  >
                    Price
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedFilters.includes("price") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedFilters.includes("price") && (
                    <div className="space-y-2 mt-2 pl-2">
                      {PRICE_RANGES.map((range) => (
                        <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="price"
                            checked={
                              selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max
                            }
                            onChange={() => setSelectedPriceRange(range)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-muted-foreground">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <button
                    onClick={() => toggleFilter("rating")}
                    className="w-full flex items-center justify-between py-2 text-foreground font-semibold hover:text-cyan-500"
                  >
                    Rating
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedFilters.includes("rating") ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedFilters.includes("rating") && (
                    <div className="space-y-2 mt-2 pl-2">
                      {RATINGS.map((rating) => (
                        <label key={rating.label} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === rating.min}
                            onChange={() => setSelectedRating(rating.min)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-muted-foreground">{rating.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Found <span className="font-bold text-foreground">{filteredResults.length}</span> results
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="rating">Sort by Rating</option>
                <option value="price">Sort by Price</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>

            {/* Results Grid */}
            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <Card key={result.id} className="p-6 hover:border-cyan-500/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">{result.title}</h3>
                        <p className="text-sm text-muted-foreground">{result.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          result.type === "article"
                            ? "bg-blue-500/20 text-blue-700"
                            : result.type === "product"
                              ? "bg-purple-500/20 text-purple-700"
                              : "bg-green-500/20 text-green-700"
                        }`}
                      >
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">{result.division}</span>
                      <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">{result.category}</span>
                      {result.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-cyan-500/20 rounded text-xs text-cyan-700">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-semibold text-foreground">{result.rating}</span>
                        </div>
                        {result.price && <span className="text-lg font-bold text-cyan-500">₹{result.price}</span>}
                        {result.date && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <Button className="bg-cyan-500 hover:bg-cyan-600">View Details</Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No results found</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
