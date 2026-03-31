import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  className?: string;
}

export function HeroBanner({
  title = siteConfig.tagline,
  subtitle = siteConfig.description,
  imageSrc = "/hero.jpg",
  className,
}: HeroBannerProps) {
  return (
    <section className={cn("bg-brand-cream relative overflow-hidden", className)}>
      <div className="container mx-auto grid min-h-[500px] items-center gap-8 px-4 py-16 md:grid-cols-2">
        {/* Text */}
        <div className="space-y-6">
          <span className="bg-brand-gold-light text-brand-gold-dark inline-block rounded-full px-4 py-1 text-xs font-semibold tracking-wider uppercase">
            Premium Collection
          </span>
          <h1 className="font-heading text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
            Dress Your Little One in{" "}
            <span className="text-brand-gold italic">Pure Bliss</span>
          </h1>
          <p className="text-muted-foreground max-w-md">{subtitle}</p>
          <div className="flex gap-3">
            <Link href="/shop">
              <Button className="bg-brand-olive hover:bg-brand-olive/90 text-white">
                Shop Now
              </Button>
            </Link>
            <Link href="/shop?view=categories">
              <Button variant="outline">Browse Collections</Button>
            </Link>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-6 pt-4">
            {siteConfig.features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-2">
                <div className="bg-brand-success/10 flex h-6 w-6 items-center justify-center rounded-full">
                  <svg
                    className="text-brand-success h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase">{feature.label}</p>
                  <p className="text-muted-foreground text-[10px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative hidden aspect-[4/5] md:block">
          <Image
            src={imageSrc}
            alt="Baby wearing adorable outfit"
            fill
            className="rounded-2xl object-cover"
            priority
            sizes="50vw"
          />
        </div>
      </div>
    </section>
  );
}
