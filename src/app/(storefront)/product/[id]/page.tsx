"use client";

import { PriceDisplay } from "@/components/ecommerce/price-display";
import { QuantitySelector } from "@/components/ecommerce/quantity-selector";
import { RatingStars } from "@/components/ecommerce/rating-stars";
import { SizePicker } from "@/components/ecommerce/size-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AGE_RANGES } from "@/config/constants";
import { useProduct, useRelatedProducts } from "@/hooks/use-products";
import { backendProductToProduct, DEFAULT_CART_COLOR } from "@/lib/product-adapter";
import { cn } from "@/lib/utils";
import { totalVariantStock, type ProductImage } from "@/services/products";
import { useCartStore } from "@/stores/cart-store";
import type { Product, ProductSize } from "@/types";
import { ArrowLeft, ImageIcon, Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function sortImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => a.order - b.order);
}

function ageRangeLabels(values: string[] | undefined): string[] {
  if (!values?.length) return [];
  const map = new Map<string, string>(AGE_RANGES.map((a) => [a.value, a.label]));
  return values.map((v) => map.get(v) ?? v.replace(/_/g, " "));
}

function ProductGallery({
  images,
  name,
  isOrganic,
}: {
  images: ProductImage[];
  name: string;
  isOrganic: boolean;
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(() => {
    if (!images.length) return 0;
    const p = images.findIndex((img) => img.isPrimary);
    return p >= 0 ? p : 0;
  });
  const currentImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      <div className="bg-muted relative mx-auto h-[min(52vh,400px)] w-full overflow-hidden rounded-2xl sm:h-[min(56vh,440px)] lg:mx-0 lg:h-[min(60vh,480px)]">
        {currentImage ? (
          <Image
            src={currentImage.url}
            alt={currentImage.altText ?? name}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
            <ImageIcon className="h-12 w-12 opacity-40" />
            <span className="text-sm">No images yet</span>
          </div>
        )}
        {isOrganic && (
          <Badge className="absolute top-4 left-4 z-10 bg-green-600 text-white">
            Organic
          </Badge>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === selectedImageIndex
                  ? "border-brand-gold ring-brand-gold/30 ring-2"
                  : "hover:border-muted-foreground/30 border-transparent"
              )}
            >
              <Image
                src={img.url}
                alt={img.altText ?? name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductPurchaseBlock({
  product,
  stockTotal,
  defaultVariantId,
}: {
  product: Product;
  stockTotal: number;
  defaultVariantId: string;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const maxQty = Math.max(1, stockTotal);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(
    () => product.sizes[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const qty = Math.min(quantity, maxQty);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Size</p>
          <span className="text-muted-foreground text-xs">Select a size</span>
        </div>
        <SizePicker
          selectedSize={selectedSize}
          availableSizes={product.sizes}
          onSelect={setSelectedSize}
        />
      </div>

      <div className="flex items-center gap-4">
        <QuantitySelector
          quantity={qty}
          onIncrement={() => setQuantity((q) => Math.min(maxQty, q + 1))}
          onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
        />
        <Button
          className="bg-brand-olive hover:bg-brand-olive/90 flex-1 text-white"
          disabled={stockTotal <= 0}
          onClick={() => {
            if (!selectedSize) {
              toast.error("Please select a size");
              return;
            }
            if (stockTotal <= 0) {
              toast.error("This product is out of stock");
              return;
            }
            addItem(product, defaultVariantId, selectedSize, DEFAULT_CART_COLOR, qty);
            toast.success("Added to cart");
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full"
        disabled={stockTotal <= 0}
        onClick={() => {
          if (!selectedSize) {
            toast.error("Please select a size");
            return;
          }
          if (stockTotal <= 0) return;
          addItem(product, defaultVariantId, selectedSize, DEFAULT_CART_COLOR, qty);
          router.push("/checkout");
        }}
      >
        Buy Now
      </Button>
    </>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: backend, isLoading, isError } = useProduct(id);
  const { data: relatedBackend = [] } = useRelatedProducts(id);

  const sortedImages = useMemo(
    () => (backend?.images?.length ? sortImages(backend.images) : []),
    [backend]
  );

  const product = useMemo(
    () => (backend ? backendProductToProduct(backend) : null),
    [backend]
  );

  const ageRangesForDisplay = useMemo(() => {
    if (!backend) return [] as string[];
    if (backend.ageRange?.length) return backend.ageRange;
    return [...new Set((backend.variants ?? []).map((v) => v.ageRange))];
  }, [backend]);

  const stockTotal = backend ? totalVariantStock(backend) : 0;
  const defaultVariantId = backend?.variants?.[0]?.id ?? "";

  const isOrganic =
    backend?.tags?.some((t) => t.toLowerCase().includes("organic")) ?? false;

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-16">
        <Loader2 className="text-brand-gold h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (isError || !backend || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4 text-lg">Product not found.</p>
        <Link
          href="/shop"
          className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/shop"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery
          key={sortedImages.map((i) => i.id).join(",")}
          images={sortedImages}
          name={backend.name}
          isOrganic={isOrganic}
        />

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="md"
            />
            <h1 className="font-heading mt-2 text-3xl font-bold">{backend.name}</h1>
            {backend.category && (
              <p className="text-muted-foreground mt-1 text-sm">
                {backend.category.name}
              </p>
            )}
          </div>

          <PriceDisplay price={product.price} salePrice={product.salePrice} size="lg" />

          {stockTotal <= 0 ? (
            <Badge variant="destructive">Out of stock</Badge>
          ) : (
            <p className="text-muted-foreground text-sm">{stockTotal} in stock</p>
          )}

          {ageRangesForDisplay.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Age ranges</p>
                <span className="text-muted-foreground text-xs">Selected in admin</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ageRangeLabels(ageRangesForDisplay).map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <ProductPurchaseBlock
            key={product.id}
            product={product}
            stockTotal={stockTotal}
            defaultVariantId={defaultVariantId}
          />

          <Separator />

          <div>
            <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">
              Description
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {backend.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
