import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid, List, Star, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Recommendation } from "@shared/schema";

export default function RecommendationsGrid() {
  const [filters, setFilters] = useState({
    category: "all",
    sortBy: "match",
    limit: 12,
    offset: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: recommendations = [], isLoading } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      params.append("sortBy", filters.sortBy);
      params.append("limit", filters.limit.toString());
      params.append("offset", filters.offset.toString());
      
      const response = await fetch(`/api/recommendations?${params}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: key === "category" && value === "all" ? "" : value, 
      offset: 0 
    }));
  };

  const handlePageChange = (direction: "prev" | "next") => {
    setFilters(prev => ({
      ...prev,
      offset: direction === "next" 
        ? prev.offset + prev.limit 
        : Math.max(0, prev.offset - prev.limit)
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-100 text-blue-800",
      Travel: "bg-violet-100 text-violet-800",
      Design: "bg-amber-100 text-amber-800",
      Fashion: "bg-pink-100 text-pink-800",
      Sports: "bg-green-100 text-green-800",
      Food: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-slate-100 text-slate-800";
  };

  if (isLoading) {
    return (
      <section id="recommendations" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-80 flex-shrink-0">
              <Skeleton className="h-64 w-full" />
            </aside>
            <main className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="recommendations" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match">Best Match</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 mr-2" />
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-2">
                            {Array.from({ length: rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-sm text-slate-700">{rating} Star{rating > 1 ? 's' : ''}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Recommendations Grid */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Your Recommendations</h2>
                <p className="text-slate-600 mt-1">
                  Showing {recommendations.length} results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12"
              : "space-y-6 mb-12"
            }>
              {recommendations.map((recommendation) => (
                <Card 
                  key={recommendation.id} 
                  className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative">
                    <img 
                      src={recommendation.imageUrl || ""} 
                      alt={recommendation.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(recommendation.category)}>
                        {recommendation.category}
                      </Badge>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-slate-600 text-sm ml-1">{recommendation.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{recommendation.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{recommendation.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900">
                        ${parseFloat(recommendation.price).toLocaleString()}
                      </span>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        View Details
                      </Button>
                    </div>
                    {recommendation.matchScore && (
                      <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {recommendation.matchScore}% Match Score
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange("prev")}
                  disabled={filters.offset === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 py-2 text-sm text-slate-600">
                  Page {Math.floor(filters.offset / filters.limit) + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange("next")}
                  disabled={recommendations.length < filters.limit}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
