import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import ProductCard from '../components/products/ProductCard';
import { Search, Filter, X, ChevronRight, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const categories = [
  { name: 'All Categories', slug: '' },
  { name: 'Cancer', slug: 'Cancer' },
  { name: 'HIV/AIDS', slug: 'HIV/AIDS' },
  { name: 'Hepatitis', slug: 'Hepatitis' },
  { name: 'Erectile Dysfunction', slug: 'Erectile Dysfunction' },
  { name: 'Diabetes & Insulin', slug: 'Diabetes & Insulin' },
  { name: 'Weight Loss', slug: 'Weight Loss' },
];

const sortOptions = [
  { value: 'discount', label: 'Highest Discount' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('discount');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (inStockOnly) params.append('in_stock', 'true');

        const response = await fetch(`${API_URL}/api/products?${params.toString()}`);
        if (response.ok) {
          let data = await response.json();
          
          // Sort products
          data = sortProducts(data, sortBy);
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, inStockOnly, sortBy]);

  const sortProducts = (products, sort) => {
    switch (sort) {
      case 'discount':
        return [...products].sort((a, b) => b.discount_percentage - a.discount_percentage);
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price);
      case 'name':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return products;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setInStockOnly(false);
    setSortBy('discount');
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Category</Label>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-white'
                  : 'hover:bg-slate-100'
              }`}
              data-testid={`filter-category-${cat.slug || 'all'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stock filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Availability</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={setInStockOnly}
            data-testid="filter-in-stock"
          />
          <label htmlFor="in-stock" className="text-sm cursor-pointer">
            In Stock Only
          </label>
        </div>
      </div>

      {/* Clear filters */}
      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full"
        data-testid="clear-filters-btn"
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" data-testid="products-page">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">Products</span>
            {selectedCategory && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-primary font-medium">{selectedCategory}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-custom py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {selectedCategory || 'All Medications'}
          </h1>
          <p className="text-slate-600">
            Browse our selection of authentic generic medications at affordable prices
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Filters</h3>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Search and sort bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Mobile filter button */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden" data-testid="mobile-filter-btn">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {(selectedCategory || inStockOnly) && (
                      <Badge className="ml-2 bg-primary text-white">Active</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <h3 className="font-heading font-semibold text-lg mb-6">Filters</h3>
                  <FilterContent />
                </SheetContent>
              </Sheet>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search medications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4"
                    data-testid="products-search-input"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </form>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48" data-testid="sort-select">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active filters */}
            {(selectedCategory || searchQuery || inStockOnly) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-slate-500">Active filters:</span>
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedCategory}
                    <button onClick={() => handleCategoryChange('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    "{searchQuery}"
                    <button onClick={() => {
                      setSearchQuery('');
                      searchParams.delete('search');
                      setSearchParams(searchParams);
                    }}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {inStockOnly && (
                  <Badge variant="secondary" className="gap-1">
                    In Stock
                    <button onClick={() => setInStockOnly(false)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-slate-500 mb-6">
              Showing {products.length} products
            </p>

            {/* Products grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">No products found</h3>
                <p className="text-slate-500 mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={clearFilters} className="rounded-full">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
