"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Baby,
  Award,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSettingsContext } from "@/context/settings-context";
import { siteConfig } from "@/config/site";

const VALUES = [
  {
    icon: Leaf,
    title: "Organic First",
    description:
      "Every fabric we choose is GOTS-certified organic cotton — free from harmful chemicals, safe against your baby's delicate skin.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Each piece is crafted by skilled artisans who care deeply about quality. We inspect every stitch before it reaches your door.",
  },
  {
    icon: ShieldCheck,
    title: "Safety Certified",
    description:
      "All our products meet OEKO-TEX® Standard 100 certification. No azo dyes, no formaldehyde, no compromises.",
  },
  {
    icon: Sparkles,
    title: "Timeless Design",
    description:
      "We believe baby clothes should be beautiful, not just practical. Our designs are heirloom-quality — made to be passed down.",
  },
];

const MILESTONES = [
  {
    year: "2019",
    label: "Founded",
    description: "Started from a mother's frustration with scratchy fabrics",
  },
  {
    year: "2020",
    label: "First 1,000 orders",
    description: "Word spread fast among Dhaka's parent community",
  },
  {
    year: "2022",
    label: "GOTS Certified",
    description: "Achieved organic certification for our entire supply chain",
  },
  {
    year: "2024",
    label: "50,000+ families",
    description: "Now trusted by families across Bangladesh",
  },
];

export default function AboutPage() {
  const { settings } = useSettingsContext();
  const storeName = settings?.storeName ?? siteConfig.name;
  const tagline = settings?.tagline ?? siteConfig.tagline;
  const logoUrl = settings?.logoUrl ?? null;

  return (
    <div className="flex flex-col">
      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div className="bg-brand-gold absolute -top-24 -right-24 h-96 w-96 rounded-full" />
          <div className="bg-brand-pink absolute -bottom-24 -left-24 h-80 w-80 rounded-full" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          {logoUrl ? (
            <div className="mb-6 flex justify-center">
              <Image
                src={logoUrl}
                alt={storeName}
                width={160}
                height={60}
                className="h-14 w-auto object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="bg-brand-gold/10 mb-6 inline-flex items-center justify-center rounded-full p-4">
              <Baby className="text-brand-gold h-10 w-10" />
            </div>
          )}
          <p className="text-brand-gold mb-3 text-xs font-semibold tracking-widest uppercase">
            Our Story
          </p>
          <h1 className="font-heading text-brand-navy mb-4 text-4xl font-bold md:text-5xl">
            {storeName}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
            {tagline}
          </p>
        </div>
      </section>

      {/* ── Story ──────────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="text-brand-gold text-xs font-semibold tracking-widest uppercase">
              How it all began
            </p>
            <h2 className="font-heading text-3xl font-bold">
              Born from a mother&apos;s search for better
            </h2>
            <div className="text-muted-foreground space-y-4 leading-relaxed">
              <p>
                {storeName} was born in 2019 when our founder, a new mother in Dhaka,
                couldn&apos;t find baby clothes that were both beautifully designed and
                made from truly safe materials. Everything imported was expensive.
                Everything local felt rough or faded after two washes.
              </p>
              <p>
                She started small — sourcing GOTS-certified organic cotton directly from
                mills, working with local craftspeople, and selling to friends. Within a
                year, she had a waiting list.
              </p>
              <p>
                Today {storeName} is trusted by over 50,000 families across Bangladesh.
                But our promise hasn&apos;t changed: every single piece we make is gentle
                enough for a newborn&apos;s skin and beautiful enough to become a
                keepsake.
              </p>
            </div>
            <Link href="/shop">
              <Button className="bg-brand-gold hover:bg-brand-gold-dark text-white">
                Shop the collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="bg-brand-gold/10 aspect-square rounded-3xl" />
            <div className="bg-brand-pink/10 absolute -right-4 -bottom-4 aspect-square w-2/3 rounded-3xl" />
            <div className="absolute inset-8 flex items-center justify-center rounded-2xl bg-white shadow-xl">
              <div className="p-8 text-center">
                <p className="font-heading text-brand-gold text-6xl font-bold">50K+</p>
                <p className="text-muted-foreground mt-1 text-sm">happy families</p>
                <Separator className="my-4" />
                <p className="font-heading text-brand-gold text-6xl font-bold">100%</p>
                <p className="text-muted-foreground mt-1 text-sm">organic cotton</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="text-brand-gold mb-3 text-xs font-semibold tracking-widest uppercase">
              What we stand for
            </p>
            <h2 className="font-heading text-3xl font-bold">Our values</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-card rounded-2xl border p-6 transition-shadow hover:shadow-md"
              >
                <div className="bg-brand-gold/10 mb-4 inline-flex rounded-xl p-3">
                  <Icon className="text-brand-gold h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ───────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <p className="text-brand-gold mb-3 text-xs font-semibold tracking-widest uppercase">
            Our journey
          </p>
          <h2 className="font-heading text-3xl font-bold">Milestones</h2>
        </div>
        <div className="relative mx-auto max-w-3xl">
          <div className="bg-border absolute left-1/2 h-full w-px -translate-x-1/2" />
          <div className="space-y-10">
            {MILESTONES.map((m, i) => (
              <div
                key={m.year}
                className={`flex items-center gap-8 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <p className="font-semibold">{m.label}</p>
                  <p className="text-muted-foreground text-sm">{m.description}</p>
                </div>
                <div className="bg-brand-gold relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg">
                  <span className="text-xs font-bold">{m.year}</span>
                </div>
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust badges ───────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {[
              {
                icon: Award,
                label: "GOTS Certified",
                sub: "Global Organic Textile Standard",
              },
              {
                icon: ShieldCheck,
                label: "OEKO-TEX® 100",
                sub: "Tested for harmful substances",
              },
              {
                icon: Users,
                label: "50,000+ Families",
                sub: "Trust us across Bangladesh",
              },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-center">
                  <Icon className="text-brand-gold h-8 w-8" />
                </div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-white/60">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-heading mb-4 text-3xl font-bold">
          Ready to dress your little one in pure bliss?
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-md text-sm">
          Browse our full collection of organic baby clothing, thoughtfully designed for
          comfort and joy.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/shop">
            <Button className="bg-brand-gold hover:bg-brand-gold-dark text-white">
              Shop now
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">Get in touch</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
