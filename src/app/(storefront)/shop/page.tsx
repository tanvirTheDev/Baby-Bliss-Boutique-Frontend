"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/ecommerce/product-grid";
import { CategoryFilter } from "@/components/ecommerce/category-filter";
import { PriceRangeSlider } from "@/components/ecommerce/price-range-slider";
import { Pagination } from "@/components/ecommerce/pagination";
import { SizePicker } from "@/components/ecommerce/size-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SORT_OPTIONS, GENDERS, ITEMS_PER_PAGE } from "@/config/constants";
import type { ProductCategory, ProductSize, Gender } from "@/types";

export default function ShopPage() {
  const [category, setCategory] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [gender, setGender] = useState<Gender | undefined>();
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Sleepwear Collection</h1>
        <p className="text-muted-foreground text-sm">Showing 24 of 86 products</p>
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <aside className="hidden w-60 shrink-0 space-y-8 lg:block">
          <CategoryFilter
            selected={category}
            onChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
          />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Size</h3>
            <SizePicker
              selectedSize={selectedSize}
              onSelect={(size) => {
                setSelectedSize(selectedSize === size ? null : size);
                setPage(1);
              }}
            />
          </div>

          <PriceRangeSlider
            value={priceRange}
            onChange={(val) => {
              setPriceRange(val);
              setPage(1);
            }}
          />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Gender</h3>
            <RadioGroup
              value={gender ?? ""}
              onValueChange={(val) => {
                setGender((val || undefined) as Gender | undefined);
                setPage(1);
              }}
            >
              {GENDERS.map((g) => (
                <div key={g.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={g.value} id={`gender-${g.value}`} />
                  <Label htmlFor={`gender-${g.value}`} className="text-sm font-normal">
                    {g.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-end">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
                <SelectTrigger className="w-40">
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

          <ProductGrid products={[]} columns={3} />

          <Pagination
            currentPage={page}
            totalPages={8}
            onPageChange={setPage}
            className="mt-8"
          />
        </div>
      </div>
    </div>
  );
}
