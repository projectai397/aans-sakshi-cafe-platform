import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Leaf,
  Droplet,
  Flame,
  Wind,
  Heart,
  Zap,
  AlertCircle,
  Clock,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: "breakfast" | "lunch" | "dinner" | "beverages" | "desserts";
  price: number;
  ingredients: string[];
  allergens: string[];
  dietaryTags: string[];
  ayurvedicBenefits: {
    vata: number;
    pitta: number;
    kapha: number;
    description: string;
  };
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  sustainabilityScore: number;
  sustainabilityNotes: string;
  isAvailable: boolean;
  preparationTime: number;
}

interface MenuDisplayProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export default function MenuDisplay({ items, onAddToCart }: MenuDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedConstitution, setSelectedConstitution] = useState<string>("none");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const categories = ["breakfast", "lunch", "dinner", "beverages", "desserts"];
  const dietaryOptions = ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free"];

  // Filter items based on selections
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by dietary preferences
    if (selectedDietary.length > 0) {
      filtered = filtered.filter((item) =>
        selectedDietary.every((tag) => item.dietaryTags.includes(tag))
      );
    }

    // Sort by Ayurvedic constitution if selected
    if (selectedConstitution !== "none") {
      const constitution = selectedConstitution as "vata" | "pitta" | "kapha";
      filtered = filtered.sort(
        (a, b) => b.ayurvedicBenefits[constitution] - a.ayurvedicBenefits[constitution]
      );
    }

    return filtered;
  }, [items, selectedCategory, selectedDietary, selectedConstitution]);

  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getConstitutionColor = (constitution: "vata" | "pitta" | "kapha") => {
    switch (constitution) {
      case "vata":
        return "text-blue-500";
      case "pitta":
        return "text-orange-500";
      case "kapha":
        return "text-green-500";
    }
  };

  const getConstitutionIcon = (constitution: "vata" | "pitta" | "kapha") => {
    switch (constitution) {
      case "vata":
        return <Wind className="h-4 w-4" />;
      case "pitta":
        return <Flame className="h-4 w-4" />;
      case "kapha":
        return <Droplet className="h-4 w-4" />;
    }
  };

  const getSustainabilityBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-lime-100 text-lime-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
        <h3 className="text-lg font-semibold mb-4">Filter Menu</h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ayurvedic Constitution Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ayurvedic Constitution</label>
            <Select value={selectedConstitution} onValueChange={setSelectedConstitution}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Items</SelectItem>
                <SelectItem value="vata">Vata (Air/Ether)</SelectItem>
                <SelectItem value="pitta">Pitta (Fire/Water)</SelectItem>
                <SelectItem value="kapha">Kapha (Water/Earth)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium">Dietary Preferences</label>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option) => (
              <Badge
                key={option}
                variant={selectedDietary.includes(option) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleDietary(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !item.isAvailable ? "opacity-50" : ""
              }`}
              onClick={() =>
                setExpandedItem(expandedItem === item.id ? null : item.id)
              }
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                  {!item.isAvailable && (
                    <Badge variant="destructive">Unavailable</Badge>
                  )}
                </div>

                {/* Dietary Tags */}
                {item.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.dietaryTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price and Prep Time */}
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-primary">₹{item.price}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {item.preparationTime} min
                  </div>
                </div>

                {/* Ayurvedic Benefits Summary */}
                <div className="bg-blue-50 rounded p-3 space-y-2">
                  <div className="text-sm font-medium">Ayurvedic Benefits</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-1">
                      <Wind className={`h-4 w-4 ${getConstitutionColor("vata")}`} />
                      <span className="text-xs">Vata: {item.ayurvedicBenefits.vata}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className={`h-4 w-4 ${getConstitutionColor("pitta")}`} />
                      <span className="text-xs">Pitta: {item.ayurvedicBenefits.pitta}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplet className={`h-4 w-4 ${getConstitutionColor("kapha")}`} />
                      <span className="text-xs">Kapha: {item.ayurvedicBenefits.kapha}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.ayurvedicBenefits.description}
                  </p>
                </div>

                {/* Sustainability Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Sustainability</span>
                  </div>
                  <Badge className={getSustainabilityBadgeColor(item.sustainabilityScore)}>
                    {item.sustainabilityScore}%
                  </Badge>
                </div>

                {/* Expanded Details */}
                {expandedItem === item.id && (
                  <div className="border-t pt-4 space-y-4">
                    {/* Nutrition Info */}
                    <div className="bg-gray-50 rounded p-3 space-y-2">
                      <div className="text-sm font-medium">Nutrition Info</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <Zap className="h-3 w-3 inline mr-1" />
                          {item.nutritionInfo.calories} cal
                        </div>
                        <div>
                          <Heart className="h-3 w-3 inline mr-1" />
                          {item.nutritionInfo.protein}g protein
                        </div>
                        <div>{item.nutritionInfo.carbs}g carbs</div>
                        <div>{item.nutritionInfo.fat}g fat</div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    {item.ingredients.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Ingredients</div>
                        <p className="text-xs text-muted-foreground">
                          {item.ingredients.join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Allergens */}
                    {item.allergens.length > 0 && (
                      <div className="bg-red-50 rounded p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-red-800">
                          <AlertCircle className="h-4 w-4" />
                          Contains Allergens
                        </div>
                        <p className="text-xs text-red-700">{item.allergens.join(", ")}</p>
                      </div>
                    )}

                    {/* Sustainability Notes */}
                    <div className="bg-green-50 rounded p-3">
                      <p className="text-xs text-green-800">{item.sustainabilityNotes}</p>
                    </div>
                  </div>
                )}

                {/* Add to Cart */}
                {item.isAvailable && (
                  <div className="flex gap-2 pt-2">
                    <div className="flex items-center border rounded">
                      <button
                        className="px-2 py-1 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: Math.max(1, (prev[item.id] || 1) - 1),
                          }));
                        }}
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-sm font-medium">
                        {quantities[item.id] || 1}
                      </span>
                      <button
                        className="px-2 py-1 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantities((prev) => ({
                            ...prev,
                            [item.id]: (prev[item.id] || 1) + 1,
                          }));
                        }}
                      >
                        +
                      </button>
                    </div>
                    <Button
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(item, quantities[item.id] || 1);
                        setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No items match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
