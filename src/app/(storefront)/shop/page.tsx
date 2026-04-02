"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StorefrontProductCard } from "@/components/ecommerce/storefront-product-card";
import { PriceRangeSlider } from "@/components/ecommerce/price-range-slider";
import { Pagination } from "@/components/ecommerce/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { AGE_RANGES, ITEMS_PER_PAGE } from "@/config/constants";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoryId") ?? undefined;

  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategory);
  const [ageRange, setAgeRange] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const { data: categories = [], isLoading: loadingCats } = useCategories();
  const activeCategories = categories.filter((c) => c.isActive);

  const sortMap: Record<
    string,
    { sortBy: "createdAt" | "price" | "rating"; sortDir: "asc" | "desc" }
  > = {
    newest: { sortBy: "createdAt", sortDir: "desc" },
    price_asc: { sortBy: "price", sortDir: "asc" },
    price_desc: { sortBy: "price", sortDir: "desc" },
    rating: { sortBy: "rating", sortDir: "desc" },
  };

  const currentSort = sortMap[sortBy] ?? sortMap.newest;

  const { data, isLoading } = useProducts({
    page,
    limit: ITEMS_PER_PAGE,
    sortBy: currentSort.sortBy,
    sortDir: currentSort.sortDir,
    ...(categoryId ? { categoryId } : {}),
    ...(ageRange ? { ageRange } : {}),
    ...(priceRange[0] > 0 ? { minPrice: priceRange[0] } : {}),
    ...(priceRange[1] < 500 ? { maxPrice: priceRange[1] } : {}),
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const totalProducts = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const clearFilters = () => {
    setCategoryId(undefined);
    setAgeRange(undefined);
    setPriceRange([0, 500]);
    setPage(1);
  };

  const hasActiveFilters =
    categoryId || ageRange || priceRange[0] > 0 || priceRange[1] < 500;

  const getCategoryName = () => {
    if (!categoryId) return "All Products";
    const cat = activeCategories.find((c) => c.id === categoryId);
    return cat?.name ?? "All Products";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">{getCategoryName()}</h1>
        <p className="text-muted-foreground text-sm">
          {isLoading
            ? "Loading..."
            : `Showing ${products.length} of ${totalProducts} products`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <aside className="hidden w-60 shrink-0 space-y-8 lg:block">
          {/* Category filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Category</h3>
            {loadingCats ? (
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            ) : (
              <RadioGroup
                value={categoryId ?? ""}
                onValueChange={(val) => {
                  setCategoryId(val || undefined);
                  setPage(1);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="cat-all" />
                  <Label htmlFor="cat-all" className="text-sm font-normal">
                    All Categories
                  </Label>
                </div>
                {activeCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={cat.id} id={`cat-${cat.id}`} />
                    <Label htmlFor={`cat-${cat.id}`} className="text-sm font-normal">
                      {cat.name}
                      {cat._count?.products != null && (
                        <span className="text-muted-foreground ml-1 text-xs">
                          ({cat._count.products})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          {/* Age Range filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Age Range</h3>
            <RadioGroup
              value={ageRange ?? ""}
              onValueChange={(val) => {
                setAgeRange(val || undefined);
                setPage(1);
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="age-all" />
                <Label htmlFor="age-all" className="text-sm font-normal">
                  All Ages
                </Label>
              </div>
              {AGE_RANGES.slice(0, 6).map((ar) => (
                <div key={ar.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={ar.value} id={`age-${ar.value}`} />
                  <Label htmlFor={`age-${ar.value}`} className="text-sm font-normal">
                    {ar.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Price range */}
          <PriceRangeSlider
            value={priceRange}
            onChange={(val) => {
              setPriceRange(val);
              setPage(1);
            }}
          />

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-end">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-lg font-medium">
                No products found
              </p>
              <p className="text-muted-foreground text-sm">
                Try adjusting your filters or search terms
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <StorefrontProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          )}
        </div>
      </div>
    </div>
  );
}
