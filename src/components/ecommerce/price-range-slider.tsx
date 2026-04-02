"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}

export function PriceRangeSlider({
  min = 0,
  max = 100,
  value,
  onChange,
  className,
}: PriceRangeSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold">Price Range</h3>
      <Slider
        min={min}
        max={max}
        step={1}
        value={value}
        onValueChange={(val) => onChange(val as [number, number])}
        className="py-4"
      />
      <div className="text-muted-foreground flex justify-between text-sm">
        <span>৳{value[0]}</span>
        <span>৳{value[1]}+</span>
      </div>
    </div>
  );
}
