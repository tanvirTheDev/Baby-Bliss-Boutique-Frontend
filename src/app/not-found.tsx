import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* soft blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="bg-brand-gold/15 pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" />

      {/* header */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <Link href="/" className="font-heading text-brand-pink text-lg font-bold">
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-2 sm:flex">
          <Link href="/shop">
            <Button variant="ghost">Shop</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        </nav>
      </header>

      {/* content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-2xl">
          <div className="bg-card/80 rounded-3xl border p-8 shadow-xl backdrop-blur sm:p-10">
            <div className="bg-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
              <SearchX className="text-muted-foreground h-7 w-7" />
            </div>

            <div className="mt-6 space-y-2 text-center">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Error 404
              </p>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl">
                This page went missing
              </h1>
              <p className="text-muted-foreground mx-auto max-w-lg text-sm sm:text-base">
                The link may be broken, or the page may have been moved. Let&apos;s get
                you back to something cozy.
              </p>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/" className="w-full sm:w-auto">
                <Button className="bg-brand-gold hover:bg-brand-gold-dark w-full text-white">
                  Go to Home
                </Button>
              </Link>
              <Link href="/shop" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  Browse Shop
                </Button>
              </Link>
            </div>

            <div className="bg-muted/60 mt-8 rounded-2xl p-5">
              <p className="text-muted-foreground text-center text-xs font-semibold tracking-wider uppercase">
                Popular destinations
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href="/shop?sort=popular">
                  <Button variant="ghost" size="sm">
                    Best Sellers
                  </Button>
                </Link>
                <Link href="/shop?sort=newest">
                  <Button variant="ghost" size="sm">
                    New Arrivals
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="ghost" size="sm">
                    Cart
                  </Button>
                </Link>
                <Link href="/checkout">
                  <Button variant="ghost" size="sm">
                    Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            If you think this is a mistake, please{" "}
            <Link href="/contact" className="text-primary font-medium hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </main>

      {/* footer */}
      <footer className="relative z-10 border-t bg-white/50">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. Crafted with love.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
