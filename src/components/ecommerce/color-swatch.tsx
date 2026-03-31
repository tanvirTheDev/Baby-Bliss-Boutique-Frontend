"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductColor } from "@/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ColorSwatchProps {
  colors: ProductColor[];
  selectedColor: ProductColor | null;
  onSelect: (color: ProductColor) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ColorSwatch({
  colors,
  selectedColor,
  onSelect,
  size = "md",
  className,
}: ColorSwatchProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {colors.map((color) => {
        const isSelected = selectedColor?.name === color.name;

        return (
          <Tooltip key={color.name}>
            <TooltipTrigger
              render={
                <button
                  onClick={() => onSelect(color)}
                  className={cn(
                    "rounded-full border-2 transition-all",
                    sizeClasses[size],
                    isSelected
                      ? "border-foreground ring-foreground ring-2 ring-offset-2"
                      : "border-border hover:border-foreground/50"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              }
            >
              {isSelected && (
                <Check
                  className={cn(
                    "mx-auto text-white mix-blend-difference",
                    size === "sm" ? "h-3 w-3" : "h-4 w-4"
                  )}
                />
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs capitalize">{color.name}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
