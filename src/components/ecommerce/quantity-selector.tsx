"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps) {
  return (
    <div
      className={cn(
        "bg-background inline-flex items-center rounded-md border",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-r-none"
        onClick={onDecrement}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="flex w-10 items-center justify-center text-sm font-medium">
        {quantity}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-l-none"
        onClick={onIncrement}
        disabled={quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
