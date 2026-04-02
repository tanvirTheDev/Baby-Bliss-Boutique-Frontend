"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { HeroBanner } from "@/components/ecommerce/hero-banner";
import { TestimonialCard } from "@/components/ecommerce/testimonial-card";
import { NewsletterForm } from "@/components/ecommerce/newsletter-form";
import { StorefrontProductCard } from "@/components/ecommerce/storefront-product-card";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";

const TESTIMONIALS = [
  {
    name: "Sarah Adams",
    rating: 5,
    comment:
      "The quality of the cotton is unlike anything I've found for my baby. So soft!",
  },
  {
    name: "David Chen",
    rating: 5,
    comment:
      "Their gift wrapping service is beyond lovely. The packaging is so beautiful, you don't even need a box.",
  },
  {
    name: "Amanda Rodriguez",
    rating: 5,
    comment:
      "Finally, a brand that understands that baby clothes can be both functional AND beautiful.",
  },
];

export default function HomePage() {
  const { data: productsData, isLoading: loadingProducts } = useProducts({
    limit: 6,
    sortBy: "createdAt",
    sortDir: "desc",
  });
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const products = productsData?.data ?? [];
  const activeCategories = (categories ?? []).filter((c) => c.isActive).slice(0, 4);

  return (
    <div>
      <HeroBanner />

      {/* Categories section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold">Explore our world</h2>
          <Link href="/shop" className="text-primary text-sm font-medium hover:underline">
            All categories &rarr;
          </Link>
        </div>
        {loadingCategories ? (
          <div className="flex justify-center py-12">
            <Loader2 className="text-brand-gold h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?categoryId=${cat.id}`}
                className="group bg-muted relative flex h-48 items-end overflow-hidden rounded-xl p-4"
              >
                <span className="relative z-10 text-sm font-semibold">{cat.name}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">New Arrivals</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              The latest additions to our collection
            </p>
          </div>
          <Link href="/shop">
            <Button variant="outline" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-16">
            <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center">
            No products yet. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
            {products.map((product) => (
              <StorefrontProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter banner */}
      <section className="bg-brand-pink-light py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading mb-2 text-2xl font-bold">
            New Arrivals Every Week
          </h2>
          <p className="text-muted-foreground mb-6">
            Stay updated on the exclusive new arrivals in our growing collections.
          </p>
          <NewsletterForm variant="banner" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-heading mb-8 text-center text-2xl font-bold">
          Moms & Dads Love Us
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </section>
    </div>
  );
}
