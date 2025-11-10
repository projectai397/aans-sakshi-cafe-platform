import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, Users, TrendingUp, Heart, Star, Search, Plus, X, MessageSquare, Award } from 'lucide-react';

export default function SubCircleMarketplace() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'sellers' | 'inventory' | 'community'>('marketplace');
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products = [
    {
      id: 'P001',
      name: 'Vintage Leather Jacket',
      seller: 'Style Collective',
      price: '₹2,499',
      originalPrice: '₹5,999',
      image: '👗',
      rating: 4.8,
      reviews: 245,
      category: 'Fashion',
      condition: 'Like New',
      inStock: 5
    },
    {
      id: 'P002',
      name: 'Handcrafted Ceramic Vase',
      seller: 'Artisan Hub',
      price: '₹1,299',
      originalPrice: '₹2,499',
      image: '🏺',
      rating: 4.9,
      reviews: 189,
      category: 'Home',
      condition: 'Excellent',
      inStock: 3
    },
    {
      id: 'P003',
      name: 'Sustainable Bamboo Bag',
      seller: 'Eco Warriors',
      price: '₹899',
      originalPrice: '₹1,799',
      image: '👜',
      rating: 4.7,
      reviews: 312,
      category: 'Accessories',
      condition: 'New',
      inStock: 12
    },
    {
      id: 'P004',
      name: 'Vintage Vinyl Records Collection',
      seller: 'Retro Vibes',
      price: '₹3,499',
      originalPrice: '₹6,999',
      image: '💿',
      rating: 4.6,
      reviews: 156,
      category: 'Entertainment',
      condition: 'Good',
      inStock: 2
    },
  ];

  const sellers = [
    {
      id: 'S001',
      name: 'Style Collective',
      category: 'Fashion & Accessories',
      followers: 2450,
      rating: 4.8,
      products: 156,
      joinedDate: 'Jan 2024',
      badge: 'Verified Creator'
    },
    {
      id: 'S002',
      name: 'Artisan Hub',
      category: 'Handmade & Crafts',
      followers: 1890,
      rating: 4.9,
      products: 89,
      joinedDate: 'Feb 2024',
      badge: 'Top Seller'
    },
    {
      id: 'S003',
      name: 'Eco Warriors',
      category: 'Sustainable Products',
      followers: 3200,
      rating: 4.7,
      products: 234,
      joinedDate: 'Dec 2023',
      badge: 'Eco Champion'
    },
  ];

  const inventoryItems = [
    { id: 'INV001', product: 'Vintage Leather Jacket', sku: 'VLJ-001', quantity: 5, price: '₹2,499', status: 'Active', lastUpdated: '2 hours ago' },
    { id: 'INV002', product: 'Ceramic Vase', sku: 'CV-045', quantity: 3, price: '₹1,299', status: 'Active', lastUpdated: '1 day ago' },
    { id: 'INV003', product: 'Bamboo Bag', sku: 'BB-123', quantity: 0, price: '₹899', status: 'Out of Stock', lastUpdated: '3 days ago' },
  ];

  const communityEvents = [
    {
      id: 'E001',
      name: 'Sustainable Fashion Swap',
      date: 'Nov 15, 2025',
      location: 'Bangalore',
      attendees: 245,
      image: '👗'
    },
    {
      id: 'E002',
      name: 'Artisan Market Festival',
      date: 'Nov 22, 2025',
      location: 'Mumbai',
      attendees: 189,
      image: '🎨'
    },
    {
      id: 'E003',
      name: 'Thrift & Chill Meetup',
      date: 'Nov 29, 2025',
      location: 'Delhi',
      attendees: 312,
      image: '🛍️'
    },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-green-900 to-teal-900 py-12">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">SubCircle Marketplace</h1>
          <p className="text-lg text-muted-foreground">Sustainable secondhand fashion & culture community</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-slate-800">
        <div className="container max-w-6xl">
          <div className="flex gap-8">
            {[
              { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
              { id: 'sellers', label: 'Sellers', icon: Users },
              { id: 'inventory', label: 'Inventory', icon: TrendingUp },
              { id: 'community', label: 'Community', icon: MessageSquare },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-green-400 text-green-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl py-8">
        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div>
            {/* Search & Filter */}
            <div className="mb-8 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="pl-10 bg-slate-800 border-slate-700 text-foreground"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', 'Fashion', 'Home', 'Accessories', 'Entertainment'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded transition-colors ${
                      selectedCategory === cat
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <Card key={product.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-green-400 transition-colors">
                  <div className="p-4">
                    <div className="text-4xl mb-3 text-center">{product.image}</div>
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.seller}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-green-400">{product.price}</span>
                      <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-foreground">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground mb-3">
                      <span className="bg-slate-700 px-2 py-1 rounded">{product.condition}</span>
                      <span className="bg-slate-700 px-2 py-1 rounded">{product.inStock} left</span>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">Add to Cart</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === 'sellers' && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Sellers</h2>
            <div className="space-y-4">
              {sellers.map(seller => (
                <Card key={seller.id} className="bg-slate-800 border-slate-700 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{seller.name}</h3>
                        <span className="px-2 py-1 bg-green-900 text-green-200 text-xs rounded font-semibold">
                          {seller.badge}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">{seller.category}</p>
                      <div className="flex gap-6 text-sm">
                        <span className="text-muted-foreground">
                          <span className="text-foreground font-semibold">{seller.followers.toLocaleString()}</span> followers
                        </span>
                        <span className="text-muted-foreground">
                          <span className="text-foreground font-semibold">{seller.products}</span> products
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-foreground font-semibold">{seller.rating}</span>
                        </span>
                        <span className="text-muted-foreground">Joined {seller.joinedDate}</span>
                      </div>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">Follow</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
              <Button
                onClick={() => setShowNewProduct(!showNewProduct)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            {showNewProduct && (
              <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-foreground">Add New Product</h3>
                  <button onClick={() => setShowNewProduct(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <Input placeholder="Product Name" className="bg-slate-700 border-slate-600 text-foreground" />
                  <Input placeholder="SKU" className="bg-slate-700 border-slate-600 text-foreground" />
                  <Input placeholder="Price" className="bg-slate-700 border-slate-600 text-foreground" />
                  <Input type="number" placeholder="Quantity" className="bg-slate-700 border-slate-600 text-foreground" />
                  <Textarea placeholder="Description" className="bg-slate-700 border-slate-600 text-foreground" rows={4} />
                  <Button className="w-full bg-green-600 hover:bg-green-700">Create Product</Button>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {inventoryItems.map(item => (
                <Card key={item.id} className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2">{item.product}</h3>
                      <div className="flex gap-6 text-sm text-muted-foreground mb-2">
                        <span>SKU: {item.sku}</span>
                        <span>Price: <span className="text-green-400 font-semibold">{item.price}</span></span>
                        <span>Quantity: <span className="text-foreground font-semibold">{item.quantity}</span></span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === 'Active' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-xs text-muted-foreground">Updated {item.lastUpdated}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="text-green-400 border-green-400 hover:bg-green-400/10">
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {communityEvents.map(event => (
                  <Card key={event.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-green-400 transition-colors">
                    <div className="p-6">
                      <div className="text-4xl mb-4">{event.image}</div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{event.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{event.date} • {event.location}</p>
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {event.attendees} attending
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700">Join Event</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Community Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Sellers', value: '2,450', icon: '👥' },
                  { label: 'Products Listed', value: '45,678', icon: '📦' },
                  { label: 'Community Members', value: '125,890', icon: '👨‍👩‍👧‍👦' },
                  { label: 'Transactions', value: '89,234', icon: '💳' },
                ].map((stat, idx) => (
                  <Card key={idx} className="bg-slate-800 border-slate-700 p-4">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-green-400">{stat.value}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Creator Spotlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Priya Sharma', specialty: 'Vintage Fashion', followers: '5.2K', badge: '⭐' },
                  { name: 'Rajesh Kumar', specialty: 'Handmade Crafts', followers: '3.8K', badge: '🏆' },
                ].map((creator, idx) => (
                  <Card key={idx} className="bg-slate-800 border-slate-700 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{creator.badge}</span>
                          <h3 className="font-bold text-foreground">{creator.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{creator.specialty}</p>
                        <p className="text-sm text-green-400 font-semibold">{creator.followers} followers</p>
                      </div>
                      <Button variant="outline" className="text-green-400 border-green-400 hover:bg-green-400/10">
                        Follow
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
