/**
 * Advanced Search & Filtering Service
 * Full-text search with faceted filtering and saved searches
 */

type SearchableEntity = 'orders' | 'inventory' | 'reviews' | 'customers' | 'staff' | 'locations';
type SearchOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';

interface SearchFilter {
  field: string;
  operator: SearchOperator;
  value: any;
  caseSensitive?: boolean;
}

interface SearchQuery {
  id: string;
  entity: SearchableEntity;
  keywords: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  createdAt: Date;
}

interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  entity: SearchableEntity;
  keywords: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isPublic: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
}

interface SearchResult {
  id: string;
  entity: SearchableEntity;
  title: string;
  description: string;
  relevanceScore: number;
  data: Record<string, any>;
}

interface SearchFacet {
  field: string;
  values: Array<{ value: any; count: number }>;
}

interface AdvancedSearchResponse {
  query: SearchQuery;
  results: SearchResult[];
  totalCount: number;
  facets: SearchFacet[];
  executionTime: number;
}

class AdvancedSearchService {
  private savedSearches: Map<string, SavedSearch> = new Map();
  private searchHistory: Map<string, SearchQuery[]> = new Map();

  /**
   * Search
   */
  async search(
    entity: SearchableEntity,
    keywords: string,
    filters: SearchFilter[] = [],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
    limit: number = 20,
    offset: number = 0
  ): Promise<AdvancedSearchResponse> {
    const startTime = Date.now();

    const query: SearchQuery = {
      id: `QUERY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entity,
      keywords,
      filters,
      sortBy,
      sortOrder,
      limit,
      offset,
      createdAt: new Date(),
    };

    // Mock search results based on entity type
    const results = this.mockSearch(entity, keywords, filters);

    // Apply sorting
    if (sortBy) {
      results.sort((a, b) => {
        const aVal = a.data[sortBy];
        const bVal = b.data[sortBy];

        if (typeof aVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
      });
    }

    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);

    // Extract facets
    const facets = this.extractFacets(entity, results);

    const executionTime = Date.now() - startTime;

    return {
      query,
      results: paginatedResults,
      totalCount: results.length,
      facets,
      executionTime,
    };
  }

  /**
   * Mock search results
   */
  private mockSearch(entity: SearchableEntity, keywords: string, filters: SearchFilter[]): SearchResult[] {
    const results: SearchResult[] = [];

    // Mock data based on entity type
    switch (entity) {
      case 'orders':
        results.push(
          {
            id: 'ORD-001',
            entity: 'orders',
            title: 'Order #ORD-001',
            description: 'Customer order from Zomato',
            relevanceScore: 0.95,
            data: { orderId: 'ORD-001', status: 'delivered', total: 450, platform: 'zomato', date: new Date() },
          },
          {
            id: 'ORD-002',
            entity: 'orders',
            title: 'Order #ORD-002',
            description: 'Customer order from Swiggy',
            relevanceScore: 0.87,
            data: { orderId: 'ORD-002', status: 'pending', total: 320, platform: 'swiggy', date: new Date() },
          }
        );
        break;

      case 'inventory':
        results.push(
          {
            id: 'INV-001',
            entity: 'inventory',
            title: 'Chicken Breast',
            description: 'Fresh chicken breast - 50kg in stock',
            relevanceScore: 0.92,
            data: { itemId: 'INV-001', category: 'meat', stock: 50, unit: 'kg', status: 'in_stock' },
          },
          {
            id: 'INV-002',
            entity: 'inventory',
            title: 'Tomatoes',
            description: 'Fresh tomatoes - Low stock',
            relevanceScore: 0.85,
            data: { itemId: 'INV-002', category: 'vegetables', stock: 5, unit: 'kg', status: 'low_stock' },
          }
        );
        break;

      case 'reviews':
        results.push(
          {
            id: 'REV-001',
            entity: 'reviews',
            title: '5 Star Review - Excellent Service',
            description: 'Great food and amazing service',
            relevanceScore: 0.9,
            data: { reviewId: 'REV-001', rating: 5, sentiment: 'positive', platform: 'google' },
          },
          {
            id: 'REV-002',
            entity: 'reviews',
            title: '2 Star Review - Poor Quality',
            description: 'Food quality was not good',
            relevanceScore: 0.88,
            data: { reviewId: 'REV-002', rating: 2, sentiment: 'negative', platform: 'zomato' },
          }
        );
        break;

      case 'customers':
        results.push(
          {
            id: 'CUST-001',
            entity: 'customers',
            title: 'John Doe',
            description: 'Regular customer - 25 orders',
            relevanceScore: 0.91,
            data: { customerId: 'CUST-001', name: 'John Doe', orders: 25, tier: 'gold' },
          },
          {
            id: 'CUST-002',
            entity: 'customers',
            title: 'Jane Smith',
            description: 'New customer - 2 orders',
            relevanceScore: 0.83,
            data: { customerId: 'CUST-002', name: 'Jane Smith', orders: 2, tier: 'bronze' },
          }
        );
        break;

      case 'staff':
        results.push(
          {
            id: 'STAFF-001',
            entity: 'staff',
            title: 'Raj Kumar - Chef',
            description: 'Senior chef with 5 years experience',
            relevanceScore: 0.89,
            data: { staffId: 'STAFF-001', name: 'Raj Kumar', role: 'chef', experience: 5 },
          },
          {
            id: 'STAFF-002',
            entity: 'staff',
            title: 'Priya Singh - Waiter',
            description: 'Experienced waiter',
            relevanceScore: 0.82,
            data: { staffId: 'STAFF-002', name: 'Priya Singh', role: 'waiter', experience: 3 },
          }
        );
        break;

      case 'locations':
        results.push(
          {
            id: 'LOC-001',
            entity: 'locations',
            title: 'Downtown Branch',
            description: 'Main location in city center',
            relevanceScore: 0.93,
            data: { locationId: 'LOC-001', name: 'Downtown', city: 'Mumbai', revenue: 1500000 },
          },
          {
            id: 'LOC-002',
            entity: 'locations',
            title: 'Airport Branch',
            description: 'Location near airport',
            relevanceScore: 0.85,
            data: { locationId: 'LOC-002', name: 'Airport', city: 'Mumbai', revenue: 800000 },
          }
        );
        break;
    }

    // Filter results based on keywords
    if (keywords) {
      const keywordLower = keywords.toLowerCase();
      return results.filter((r) => r.title.toLowerCase().includes(keywordLower) || r.description.toLowerCase().includes(keywordLower));
    }

    return results;
  }

  /**
   * Extract facets from results
   */
  private extractFacets(entity: SearchableEntity, results: SearchResult[]): SearchFacet[] {
    const facets: SearchFacet[] = [];

    switch (entity) {
      case 'orders':
        const statuses: Record<string, number> = {};
        const platforms: Record<string, number> = {};

        for (const result of results) {
          statuses[result.data.status] = (statuses[result.data.status] || 0) + 1;
          platforms[result.data.platform] = (platforms[result.data.platform] || 0) + 1;
        }

        facets.push({
          field: 'status',
          values: Object.entries(statuses).map(([value, count]) => ({ value, count })),
        });

        facets.push({
          field: 'platform',
          values: Object.entries(platforms).map(([value, count]) => ({ value, count })),
        });
        break;

      case 'inventory':
        const categories: Record<string, number> = {};
        const stockStatus: Record<string, number> = {};

        for (const result of results) {
          categories[result.data.category] = (categories[result.data.category] || 0) + 1;
          stockStatus[result.data.status] = (stockStatus[result.data.status] || 0) + 1;
        }

        facets.push({
          field: 'category',
          values: Object.entries(categories).map(([value, count]) => ({ value, count })),
        });

        facets.push({
          field: 'status',
          values: Object.entries(stockStatus).map(([value, count]) => ({ value, count })),
        });
        break;

      case 'reviews':
        const sentiments: Record<string, number> = {};
        const ratings: Record<string, number> = {};

        for (const result of results) {
          sentiments[result.data.sentiment] = (sentiments[result.data.sentiment] || 0) + 1;
          ratings[result.data.rating] = (ratings[result.data.rating] || 0) + 1;
        }

        facets.push({
          field: 'sentiment',
          values: Object.entries(sentiments).map(([value, count]) => ({ value, count })),
        });

        facets.push({
          field: 'rating',
          values: Object.entries(ratings).map(([value, count]) => ({ value, count })),
        });
        break;
    }

    return facets;
  }

  /**
   * Save search
   */
  async saveSearch(userId: string, name: string, entity: SearchableEntity, keywords: string, filters: SearchFilter[], sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<SavedSearch> {
    const savedSearch: SavedSearch = {
      id: `SAVED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name,
      entity,
      keywords,
      filters,
      sortBy,
      sortOrder,
      isPublic: false,
      createdAt: new Date(),
      usageCount: 0,
    };

    this.savedSearches.set(savedSearch.id, savedSearch);
    return savedSearch;
  }

  /**
   * Get saved searches
   */
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return Array.from(this.savedSearches.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => (b.lastUsedAt?.getTime() || 0) - (a.lastUsedAt?.getTime() || 0));
  }

  /**
   * Execute saved search
   */
  async executeSavedSearch(searchId: string): Promise<AdvancedSearchResponse> {
    const savedSearch = this.savedSearches.get(searchId);
    if (!savedSearch) {
      throw new Error(`Saved search ${searchId} not found`);
    }

    savedSearch.lastUsedAt = new Date();
    savedSearch.usageCount++;

    return this.search(savedSearch.entity, savedSearch.keywords, savedSearch.filters, savedSearch.sortBy, savedSearch.sortOrder);
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
    this.savedSearches.delete(searchId);
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(entity: SearchableEntity, partial: string): Promise<string[]> {
    // Mock suggestions based on entity
    const suggestions: Record<SearchableEntity, string[]> = {
      orders: ['Order status', 'Order date', 'Order total', 'Platform'],
      inventory: ['Item name', 'Category', 'Stock level', 'Unit cost'],
      reviews: ['Rating', 'Sentiment', 'Platform', 'Date'],
      customers: ['Name', 'Tier', 'Orders', 'Loyalty points'],
      staff: ['Name', 'Role', 'Location', 'Salary'],
      locations: ['Name', 'City', 'Revenue', 'Staff count'],
    };

    return suggestions[entity].filter((s) => s.toLowerCase().includes(partial.toLowerCase()));
  }
}

export default AdvancedSearchService;
