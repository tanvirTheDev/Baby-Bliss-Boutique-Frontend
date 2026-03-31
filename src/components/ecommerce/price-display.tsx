import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PriceDisplayProps {
  price: number;
  salePrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  price,
  salePrice,
  size = "md",
  className,
}: PriceDisplayProps) {
  const isOnSale = salePrice !== undefined && salePrice < price;
  const discount = isOnSale ? Math.round(((price - salePrice) / price) * 100) : 0;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl font-bold",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          sizeClasses[size],
          "font-semibold",
          isOnSale ? "text-foreground" : "text-foreground"
        )}
      >
        ${(isOnSale ? salePrice : price).toFixed(2)}
      </span>
      {isOnSale && (
        <>
          <span
            className={cn(
              "text-muted-foreground line-through",
              size === "lg" ? "text-base" : "text-sm"
            )}
          >
            ${price.toFixed(2)}
          </span>
          <Badge
            variant="secondary"
            className="bg-red-100 text-xs font-medium text-red-700"
          >
            {discount}% OFF
          </Badge>
        </>
      )}
    </div>
  );
}
