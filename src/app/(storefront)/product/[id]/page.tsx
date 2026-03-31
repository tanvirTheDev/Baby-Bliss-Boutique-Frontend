"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriceDisplay } from "@/components/ecommerce/price-display";
import { RatingStars } from "@/components/ecommerce/rating-stars";
import { SizePicker } from "@/components/ecommerce/size-picker";
import { ColorSwatch } from "@/components/ecommerce/color-swatch";
import { QuantitySelector } from "@/components/ecommerce/quantity-selector";
import { ProductGrid } from "@/components/ecommerce/product-grid";
import type { ProductSize, ProductColor } from "@/types";

export default function ProductDetailPage() {
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>("0-3M");
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [quantity, setQuantity] = useState(1);

  const placeholderColors: ProductColor[] = [
    { name: "Rose Pink", hex: "#f4a5c0" },
    { name: "Soft Cream", hex: "#faf0e6" },
    { name: "Sky Blue", hex: "#b0d4f1" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="bg-muted relative aspect-square overflow-hidden rounded-2xl">
            <Badge className="absolute top-4 left-4 z-10 bg-green-600 text-white">
              Organic Cotton
            </Badge>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <button
                key={i}
                className="bg-muted hover:border-primary relative h-16 w-16 overflow-hidden rounded-lg border transition-colors"
              />
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <RatingStars rating={4.9} reviewCount={124} size="md" />
            <h1 className="font-heading mt-2 text-3xl font-bold">
              Rose Petal Tulle Baby Dress
            </h1>
          </div>

          <PriceDisplay price={60} salePrice={48} size="lg" />

          {/* Color */}
          <div className="space-y-3">
            <p className="text-sm font-medium">
              Color:{" "}
              <span className="text-muted-foreground font-normal capitalize">
                {selectedColor?.name ?? "Select a color"}
              </span>
            </p>
            <ColorSwatch
              colors={placeholderColors}
              selectedColor={selectedColor}
              onSelect={setSelectedColor}
              size="md"
            />
          </div>

          {/* Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Size</p>
              <button className="text-primary text-sm hover:underline">Size Guide</button>
            </div>
            <SizePicker selectedSize={selectedSize} onSelect={setSelectedSize} />
          </div>

          {/* Quantity & add to cart */}
          <div className="flex items-center gap-4">
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity((q) => q + 1)}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            />
            <Button className="bg-brand-olive hover:bg-brand-olive/90 flex-1 text-white">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          <Button variant="outline" className="w-full">
            Buy Now
          </Button>

          {/* Features */}
          <div className="bg-muted/30 flex justify-center gap-6 rounded-xl border p-4">
            {[
              { icon: "cotton", label: "100% Organic Cotton" },
              { icon: "wash", label: "Gentle Machine Wash" },
              { icon: "age", label: "Ages 0-24 Months" },
            ].map((feature) => (
              <div key={feature.label} className="text-center">
                <p className="text-xs font-medium">{feature.label}</p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Accordion-style sections */}
          {["Product Description", "Size Guide", "Shipping & Returns"].map((section) => (
            <button
              key={section}
              className="flex w-full items-center justify-between py-3 text-sm font-medium"
            >
              {section}
              <span className="text-muted-foreground">&darr;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Related products */}
      <section className="mt-16">
        <h2 className="font-heading mb-6 text-2xl font-bold">Complete the Look</h2>
        <ProductGrid products={[]} columns={4} />
      </section>
    </div>
  );
}
