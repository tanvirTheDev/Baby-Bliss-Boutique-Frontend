"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useSettingsContext } from "@/context/settings-context";
import { siteConfig } from "@/config/site";

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const INITIAL: FormState = { name: "", email: "", phone: "", subject: "", message: "" };

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Inside Dhaka: 1–2 business days. Outside Dhaka: 3–5 business days. Express options available at checkout.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery for unworn, unwashed items with original tags. Contact us to initiate a return.",
  },
  {
    q: "Are all products made from organic cotton?",
    a: "Yes. Every fabric we use is GOTS-certified organic cotton. You'll see the certification on each product page.",
  },
  {
    q: "Do you ship outside Bangladesh?",
    a: "Currently we ship within Bangladesh only. International shipping is coming in 2025.",
  },
];

export default function ContactPage() {
  const { settings } = useSettingsContext();
  const storeName = settings?.storeName ?? siteConfig.name;
  const supportEmail = settings?.supportEmail ?? settings?.businessEmail ?? null;
  const phone = settings?.phone ?? null;
  const whatsappNumber = settings?.whatsappNumber ?? null;
  const addressLine1 = settings?.addressLine1 ?? null;
  const addressLine2 = settings?.addressLine2 ?? null;
  const district = settings?.district ?? null;
  const division = settings?.division ?? null;
  const facebookUrl = settings?.facebookUrl ?? null;
  const instagramUrl = settings?.instagramUrl ?? siteConfig.links.instagram;
  const youtubeUrl = settings?.youtubeUrl ?? null;
  const whatsappGroupUrl = settings?.whatsappGroupUrl ?? null;

  const [form, setForm] = useState<FormState>(INITIAL);
  const [sending, setSending] = useState(false);

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm(INITIAL);
  };

  const addressParts = [addressLine1, addressLine2, district, division].filter(Boolean);

  return (
    <div className="flex flex-col">
      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="bg-brand-gold/10 mb-6 inline-flex items-center justify-center rounded-full p-4">
            <MessageCircle className="text-brand-gold h-8 w-8" />
          </div>
          <p className="text-brand-gold mb-3 text-xs font-semibold tracking-widest uppercase">
            We&apos;d love to hear from you
          </p>
          <h1 className="font-heading text-brand-navy mb-4 text-4xl font-bold md:text-5xl">
            Contact us
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-lg">
            Questions about an order, a product, or just want to say hello? Our team
            responds within 24 hours.
          </p>
        </div>
      </section>

      {/* ── Main content ───────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* ── Contact info sidebar ─────────────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-1">
            <div>
              <h2 className="font-heading mb-6 text-xl font-bold">Get in touch</h2>
              <div className="space-y-5">
                {supportEmail && (
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-gold/10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Mail className="text-brand-gold h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase">
                        Email
                      </p>
                      <a
                        href={`mailto:${supportEmail}`}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {supportEmail}
                      </a>
                    </div>
                  </div>
                )}

                {(phone || whatsappNumber) && (
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-gold/10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Phone className="text-brand-gold h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase">
                        Phone
                      </p>
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
                        >
                          {phone}
                        </a>
                      )}
                      {whatsappNumber && whatsappNumber !== phone && (
                        <a
                          href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                          className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {whatsappNumber} (WhatsApp)
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {addressParts.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-gold/10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <MapPin className="text-brand-gold h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase">
                        Address
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {addressParts.join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="bg-brand-gold/10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <Clock className="text-brand-gold h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase">
                      Hours
                    </p>
                    <p className="text-muted-foreground text-sm">Sat–Thu, 9am – 6pm</p>
                    <p className="text-muted-foreground text-sm">Friday closed</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Social links */}
            <div>
              <p className="mb-4 text-xs font-semibold tracking-wider uppercase">
                Follow us
              </p>
              <div className="flex gap-3">
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted hover:bg-brand-gold/10 hover:text-brand-gold flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted hover:bg-brand-gold/10 hover:text-brand-gold flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted hover:bg-brand-gold/10 hover:text-brand-gold flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                    aria-label="YouTube"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
                {whatsappGroupUrl && (
                  <a
                    href={whatsappGroupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-muted hover:bg-brand-gold/10 hover:text-brand-gold flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                    aria-label="WhatsApp Group"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ── Contact form ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border p-8">
              <h2 className="font-heading mb-2 text-xl font-bold">Send us a message</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Fill in the form and we&apos;ll respond within 24 hours on business days.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase">
                      Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase">
                      Phone
                      <span className="text-muted-foreground ml-1 font-normal normal-case">
                        optional
                      </span>
                    </Label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+880 1XXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase">Subject</Label>
                    <Input
                      value={form.subject}
                      onChange={set("subject")}
                      placeholder="Order issue, product question…"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us how we can help…"
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    sending ||
                    !form.name.trim() ||
                    !form.email.trim() ||
                    !form.message.trim()
                  }
                  className="bg-brand-gold hover:bg-brand-gold-dark w-full text-white"
                >
                  {sending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="text-brand-gold mb-3 text-xs font-semibold tracking-widest uppercase">
              Common questions
            </p>
            <h2 className="font-heading text-3xl font-bold">Frequently asked</h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-card rounded-xl border p-5">
                <p className="mb-2 text-sm font-semibold">{q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom strip ───────────────────────────────────────────────────────── */}
      <section className="bg-brand-gold py-10 text-center text-white">
        <div className="container mx-auto px-4">
          <p className="font-heading text-xl font-bold">{storeName}</p>
          <p className="mt-1 text-sm text-white/80">
            Nurturing every little step — right here in Bangladesh.
          </p>
        </div>
      </section>
    </div>
  );
}
