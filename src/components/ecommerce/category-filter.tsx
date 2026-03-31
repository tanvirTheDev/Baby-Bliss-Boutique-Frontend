"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PRODUCT_CATEGORIES } from "@/config/constants";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selected: string | undefined;
  onChange: (category: string | undefined) => void;
  className?: string;
}

export function CategoryFilter({ selected, onChange, className }: CategoryFilterProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold">Category</h3>
      <RadioGroup
        value={selected ?? ""}
        onValueChange={(val) => onChange(val || undefined)}
      >
        {PRODUCT_CATEGORIES.map((cat) => (
          <div key={cat.value} className="flex items-center space-x-2">
            <RadioGroupItem value={cat.value} id={`cat-${cat.value}`} />
            <Label htmlFor={`cat-${cat.value}`} className="text-sm font-normal">
              {cat.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
