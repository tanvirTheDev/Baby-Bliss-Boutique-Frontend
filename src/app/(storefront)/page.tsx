import { HeroBanner } from "@/components/ecommerce/hero-banner";
import { TestimonialCard } from "@/components/ecommerce/testimonial-card";
import { NewsletterForm } from "@/components/ecommerce/newsletter-form";
import { siteConfig } from "@/config/site";

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
  return (
    <div>
      <HeroBanner />

      {/* Categories section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold">Explore our world</h2>
          <a href="/shop" className="text-primary text-sm font-medium hover:underline">
            All categories &rarr;
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Newborn", "Infant Wear", "Toddler Style", "Gift Sets"].map((cat) => (
            <a
              key={cat}
              href={`/shop?category=${cat.toLowerCase().replace(" ", "-")}`}
              className="group bg-muted relative flex h-48 items-end overflow-hidden rounded-xl p-4"
            >
              <span className="relative z-10 text-sm font-semibold">{cat}</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </div>
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
