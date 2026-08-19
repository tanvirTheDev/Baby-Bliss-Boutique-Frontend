"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StorefrontProductCard } from "./storefront-product-card";
import type { BackendProduct } from "@/services/products";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  products: BackendProduct[];
  className?: string;
}

/**
 * Horizontally scrolling product strip with prev/next controls.
 *
 * Built on native overflow scrolling with scroll-snap rather than a carousel
 * library: touch swipe, trackpad and keyboard scrolling all work without any
 * extra JavaScript, and it adds nothing to the bundle. The buttons just drive
 * scrollBy, so they stay in sync with whatever the user does by hand.
 */
export function ProductCarousel({ products, className }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const syncControls = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // A 1px tolerance: fractional widths mean scrollLeft rarely lands exactly
    // on the maximum, which would otherwise leave the next button enabled.
    setCanScrollBack(el.scrollLeft > 1);
    setCanScrollForward(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    syncControls();

    const observer = new ResizeObserver(syncControls);
    observer.observe(el);

    return () => observer.disconnect();
  }, [syncControls, products.length]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Just under a full viewport keeps one card in view as an anchor.
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  const hasControls = canScrollBack || canScrollForward;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        onScroll={syncControls}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[calc(50%-0.5rem)] shrink-0 snap-start sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-0.75rem)]"
          >
            <StorefrontProductCard product={product} className="h-full" />
          </div>
        ))}
      </div>

      {/* Controls sit outside the track so they never cover a card's own
          buttons, and disappear entirely when everything already fits. */}
      {hasControls && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous products"
            disabled={!canScrollBack}
            onClick={() => scrollByPage(-1)}
            className="bg-background absolute top-1/2 -left-4 z-10 hidden h-9 w-9 -translate-y-1/2 rounded-full shadow-md disabled:opacity-0 sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next products"
            disabled={!canScrollForward}
            onClick={() => scrollByPage(1)}
            className="bg-background absolute top-1/2 -right-4 z-10 hidden h-9 w-9 -translate-y-1/2 rounded-full shadow-md disabled:opacity-0 sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
