"use client";

import { cn } from "@/lib/utils";
import type { ProductSize } from "@/types";
import { PRODUCT_SIZES } from "@/config/constants";

interface SizePickerProps {
  selectedSize: ProductSize | null;
  availableSizes?: ProductSize[];
  onSelect: (size: ProductSize) => void;
  className?: string;
}

export function SizePicker({
  selectedSize,
  availableSizes = [...PRODUCT_SIZES],
  onSelect,
  className,
}: SizePickerProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {PRODUCT_SIZES.map((size) => {
        const isAvailable = availableSizes.includes(size);
        const isSelected = selectedSize === size;

        return (
          <button
            key={size}
            onClick={() => isAvailable && onSelect(size)}
            disabled={!isAvailable}
            className={cn(
              "flex h-10 min-w-[3rem] items-center justify-center rounded-md border px-3 text-sm font-medium transition-all",
              isSelected
                ? "border-foreground bg-foreground text-background"
                : isAvailable
                  ? "border-border bg-background hover:border-foreground"
                  : "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
