import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  Leaf,
  AlertCircle,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  dietaryTags: string[];
  ayurvedicBenefits: {
    vata: number;
    pitta: number;
    kapha: number;
    description: string;
  };
  sustainabilityScore: number;
  isAvailable: boolean;
  preparationTime: number;
}

interface AdminMenuDashboardProps {
  items: MenuItem[];
  onAddItem: (item: Partial<MenuItem>) => void;
  onUpdateItem: (id: string, item: Partial<MenuItem>) => void;
  onDeleteItem: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  analytics?: {
    totalItems: number;
    availableItems: number;
    categoryCounts: Record<string, number>;
    averageSustainabilityScore: number;
    mostPopularCategory: string;
  };
}

export default function AdminMenuDashboard({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleAvailability,
  analytics,
}: AdminMenuDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    category: "breakfast",
    price: 0,
    dietaryTags: [],
    ayurvedicBenefits: {
      vata: 5,
      pitta: 5,
      kapha: 5,
      description: "Balanced for all constitutions",
    },
    sustainabilityScore: 75,
    preparationTime: 15,
  });

  const categories = ["breakfast", "lunch", "dinner", "beverages", "desserts"];
  const dietaryOptions = ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free"];

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        category: "breakfast",
        price: 0,
        dietaryTags: [],
        ayurvedicBenefits: {
          vata: 5,
          pitta: 5,
          kapha: 5,
          description: "Balanced for all constitutions",
        },
        sustainabilityScore: 75,
        preparationTime: 15,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingId) {
      onUpdateItem(editingId, formData);
    } else {
      onAddItem(formData);
    }

    setIsDialogOpen(false);
  };

  const toggleDietary = (tag: string) => {
    const current = formData.dietaryTags || [];
    setFormData({
      ...formData,
      dietaryTags: current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag],
    });
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-lime-100 text-lime-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  return (
    <div className="w-full space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.availableItems} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sustainability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageSustainabilityScore}%</div>
              <p className="text-xs text-muted-foreground">Average score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {analytics.mostPopularCategory}
              </div>
              <p className="text-xs text-muted-foreground">Category</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(analytics.categoryCounts).length}</div>
              <p className="text-xs text-muted-foreground">Active categories</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Item Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Items</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update the menu item details"
                  : "Add a new item to your menu with Ayurvedic benefits and sustainability information"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name *</label>
                <Input
                  placeholder="e.g., Masala Dosa"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe the item..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select
                    value={formData.category || "breakfast"}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₹) *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Dietary Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Dietary Tags</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={
                        formData.dietaryTags?.includes(option) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleDietary(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Ayurvedic Benefits */}
              <div className="bg-blue-50 rounded p-4 space-y-3">
                <h4 className="font-medium">Ayurvedic Benefits (0-10 scale)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Vata</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.ayurvedicBenefits?.vata || 5}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ayurvedicBenefits: {
                            ...formData.ayurvedicBenefits!,
                            vata: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Pitta</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.ayurvedicBenefits?.pitta || 5}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ayurvedicBenefits: {
                            ...formData.ayurvedicBenefits!,
                            pitta: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Kapha</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.ayurvedicBenefits?.kapha || 5}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ayurvedicBenefits: {
                            ...formData.ayurvedicBenefits!,
                            kapha: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Sustainability */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sustainability Score (0-100)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sustainabilityScore || 75}
                  onChange={(e) =>
                    setFormData({ ...formData, sustainabilityScore: parseInt(e.target.value) })
                  }
                />
              </div>

              {/* Preparation Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Preparation Time (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.preparationTime || 15}
                  onChange={(e) =>
                    setFormData({ ...formData, preparationTime: parseInt(e.target.value) })
                  }
                />
              </div>

              <Button className="w-full" onClick={handleSaveItem}>
                {editingId ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sustainability</TableHead>
                  <TableHead>Prep Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">{item.category}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>
                      <Badge className={getSustainabilityColor(item.sustainabilityScore)}>
                        <Leaf className="h-3 w-3 mr-1" />
                        {item.sustainabilityScore}%
                      </Badge>
                    </TableCell>
                    <TableCell>{item.preparationTime} min</TableCell>
                    <TableCell>
                      {item.isAvailable ? (
                        <Badge variant="default">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleAvailability(item.id)}
                        title={item.isAvailable ? "Mark unavailable" : "Mark available"}
                      >
                        {item.isAvailable ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">No menu items yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start by adding your first menu item
                </p>
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
