"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Settings2,
  Building2,
  Share2,
  ShoppingCart,
  Truck,
  CreditCard,
  Globe,
  Search,
  Wrench,
  Upload,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSettings,
  useUpdateSettings,
  useUploadSettingsImages,
} from "@/hooks/use-settings";
import type { Settings } from "@/services/settings";
import { cn } from "@/lib/utils";

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="flex-shrink-0"
      >
        <div
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            checked ? "bg-brand-gold" : "bg-muted"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </div>
      </button>
    </div>
  );
}

// ─── Image Upload Field ────────────────────────────────────────────────────────

function ImageUploadField({
  label,
  currentUrl,
  file,
  onFileChange,
  hint,
}: {
  label: string;
  currentUrl: string | null | undefined;
  file: File | null;
  onFileChange: (f: File | null) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : currentUrl;

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase">{label}</Label>
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
      <div className="flex items-center gap-3">
        <div className="bg-muted flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border">
          {preview ? (
            <Image
              src={preview}
              alt={label}
              width={64}
              height={64}
              className="h-full w-full object-contain"
              unoptimized
            />
          ) : (
            <ImageIcon className="text-muted-foreground h-6 w-6" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {file ? "Change" : "Upload"}
          </Button>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-7 text-xs"
              onClick={() => onFileChange(null)}
            >
              Remove
            </Button>
          )}
        </div>
        {file && (
          <p className="text-muted-foreground max-w-[160px] truncate text-xs">
            {file.name}
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

// ─── Color Field ───────────────────────────────────────────────────────────────

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded border p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          maxLength={7}
          className="font-mono uppercase"
        />
      </div>
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {title}
      </h3>
      {children}
      <Separator />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsAdminPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const uploadMutation = useUploadSettingsImages();

  // ── Branding ─────────────────────────────────────────────────────────────────
  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState("#000000");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDarkFile, setLogoDarkFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  // ── Business ──────────────────────────────────────────────────────────────────
  const [businessEmail, setBusinessEmail] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [upazila, setUpazila] = useState("");
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [tradeLicenseNo, setTradeLicenseNo] = useState("");
  const [tinNo, setTinNo] = useState("");
  const [binNo, setBinNo] = useState("");

  // ── Social ────────────────────────────────────────────────────────────────────
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState("");

  // ── Commerce ──────────────────────────────────────────────────────────────────
  const [currencyCode, setCurrencyCode] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [vatRate, setVatRate] = useState("");
  const [vatInclusive, setVatInclusive] = useState(false);

  // ── Shipping ──────────────────────────────────────────────────────────────────
  const [insideDhakaFee, setInsideDhakaFee] = useState("");
  const [outsideDhakaFee, setOutsideDhakaFee] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");

  // ── Payment ───────────────────────────────────────────────────────────────────
  const [codEnabled, setCodEnabled] = useState(false);
  const [bkashEnabled, setBkashEnabled] = useState(false);
  const [nagadEnabled, setNagadEnabled] = useState(false);
  const [rocketEnabled, setRocketEnabled] = useState(false);
  const [sslCommerzEnabled, setSslCommerzEnabled] = useState(false);

  // ── Courier ───────────────────────────────────────────────────────────────────
  const [steadfastEnabled, setSteadfastEnabled] = useState(false);
  const [pathaoEnabled, setPathaoEnabled] = useState(false);
  const [redxEnabled, setRedxEnabled] = useState(false);

  // ── Localization ──────────────────────────────────────────────────────────────
  const [timezone, setTimezone] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [locale, setLocale] = useState("");

  // ── SEO ───────────────────────────────────────────────────────────────────────
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [gtmId, setGtmId] = useState("");
  const [facebookPixelId, setFacebookPixelId] = useState("");
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);

  // ── System ────────────────────────────────────────────────────────────────────
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [allowGuestCheckout, setAllowGuestCheckout] = useState(true);
  const [requirePhoneVerify, setRequirePhoneVerify] = useState(false);
  const [requireEmailVerify, setRequireEmailVerify] = useState(false);

  // ── Populate from API ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!settings) return;
    const s = settings as Settings;

    setStoreName(s.storeName ?? "");
    setTagline(s.tagline ?? "");
    setPrimaryColor(s.primaryColor ?? "#000000");
    setSecondaryColor(s.secondaryColor ?? "#000000");
    setAccentColor(s.accentColor ?? "#000000");

    setBusinessEmail(s.businessEmail ?? "");
    setSupportEmail(s.supportEmail ?? "");
    setPhone(s.phone ?? "");
    setWhatsappNumber(s.whatsappNumber ?? "");
    setAddressLine1(s.addressLine1 ?? "");
    setAddressLine2(s.addressLine2 ?? "");
    setUpazila(s.Upazila ?? "");
    setDistrict(s.district ?? "");
    setDivision(s.division ?? "");
    setPostalCode(s.postalCode ?? "");
    setCountry(s.country ?? "");
    setTradeLicenseNo(s.tradeLicenseNo ?? "");
    setTinNo(s.tinNo ?? "");
    setBinNo(s.binNo ?? "");

    setFacebookUrl(s.facebookUrl ?? "");
    setInstagramUrl(s.instagramUrl ?? "");
    setYoutubeUrl(s.youtubeUrl ?? "");
    setTiktokUrl(s.tiktokUrl ?? "");
    setWhatsappGroupUrl(s.whatsappGroupUrl ?? "");

    setCurrencyCode(s.currencyCode ?? "");
    setCurrencySymbol(s.currencySymbol ?? "");
    setVatRate(String(s.vatRate ?? 0));
    setVatInclusive(s.vatInclusive ?? false);

    setInsideDhakaFee(String(s.insideDhakaFee ?? 0));
    setOutsideDhakaFee(String(s.outsideDhakaFee ?? 0));
    setFreeShippingThreshold(
      s.freeShippingThreshold != null ? String(s.freeShippingThreshold) : ""
    );
    setLowStockThreshold(String(s.lowStockThreshold ?? 10));

    setCodEnabled(s.codEnabled ?? false);
    setBkashEnabled(s.bkashEnabled ?? false);
    setNagadEnabled(s.nagadEnabled ?? false);
    setRocketEnabled(s.rocketEnabled ?? false);
    setSslCommerzEnabled(s.sslCommerzEnabled ?? false);

    setSteadfastEnabled(s.steadfastEnabled ?? false);
    setPathaoEnabled(s.pathaoEnabled ?? false);
    setRedxEnabled(s.redxEnabled ?? false);

    setTimezone(s.timezone ?? "");
    setDateFormat(s.dateFormat ?? "");
    setLocale(s.locale ?? "");

    setMetaTitle(s.metaTitle ?? "");
    setMetaDescription(s.metaDescription ?? "");
    setMetaKeywords(s.metaKeywords ?? "");
    setGoogleAnalyticsId(s.googleAnalyticsId ?? "");
    setGtmId(s.gtmId ?? "");
    setFacebookPixelId(s.facebookPixelId ?? "");
    setRobotsIndex(s.robotsIndex ?? true);

    setMaintenanceMode(s.maintenanceMode ?? false);
    setMaintenanceMessage(s.maintenanceMessage ?? "");
    setAllowGuestCheckout(s.allowGuestCheckout ?? true);
    setRequirePhoneVerify(s.requirePhoneVerify ?? false);
    setRequireEmailVerify(s.requireEmailVerify ?? false);
  }, [settings]);

  // ── Save handlers ─────────────────────────────────────────────────────────────

  const saveBranding = () => {
    const hasImages = logoFile || logoDarkFile || faviconFile;

    const textData = {
      ...(storeName ? { storeName } : {}),
      ...(tagline ? { tagline } : {}),
      primaryColor,
      secondaryColor,
      accentColor,
    };

    if (hasImages) {
      uploadMutation.mutate(
        { logo: logoFile, logoDark: logoDarkFile, favicon: faviconFile },
        {
          onSuccess: () => {
            setLogoFile(null);
            setLogoDarkFile(null);
            setFaviconFile(null);
            if (Object.keys(textData).length > 0) updateMutation.mutate(textData);
          },
        }
      );
    } else {
      if (Object.keys(textData).length > 0) updateMutation.mutate(textData);
    }
  };

  const saveBusiness = () =>
    updateMutation.mutate({
      ...(businessEmail ? { businessEmail } : {}),
      ...(supportEmail ? { supportEmail } : {}),
      ...(phone ? { phone } : {}),
      ...(whatsappNumber ? { whatsappNumber } : {}),
      ...(addressLine1 ? { addressLine1 } : {}),
      ...(addressLine2 ? { addressLine2 } : {}),
      ...(upazila ? { Upazila: upazila } : {}),
      ...(district ? { district } : {}),
      ...(division ? { division } : {}),
      ...(postalCode ? { postalCode } : {}),
      ...(country ? { country } : {}),
      ...(tradeLicenseNo ? { tradeLicenseNo } : {}),
      ...(tinNo ? { tinNo } : {}),
      ...(binNo ? { binNo } : {}),
    });

  const saveSocial = () =>
    updateMutation.mutate({
      ...(facebookUrl ? { facebookUrl } : {}),
      ...(instagramUrl ? { instagramUrl } : {}),
      ...(youtubeUrl ? { youtubeUrl } : {}),
      ...(tiktokUrl ? { tiktokUrl } : {}),
      ...(whatsappGroupUrl ? { whatsappGroupUrl } : {}),
    });

  const saveCommerce = () =>
    updateMutation.mutate({
      ...(currencyCode ? { currencyCode } : {}),
      ...(currencySymbol ? { currencySymbol } : {}),
      vatRate: vatRate ? Number(vatRate) : 0,
      vatInclusive,
    });

  const saveShipping = () =>
    updateMutation.mutate({
      insideDhakaFee: Number(insideDhakaFee) || 0,
      outsideDhakaFee: Number(outsideDhakaFee) || 0,
      freeShippingThreshold: freeShippingThreshold ? Number(freeShippingThreshold) : null,
      lowStockThreshold: Number(lowStockThreshold) || 10,
    });

  const savePayments = () =>
    updateMutation.mutate({
      codEnabled,
      bkashEnabled,
      nagadEnabled,
      rocketEnabled,
      sslCommerzEnabled,
    });

  const saveCouriers = () =>
    updateMutation.mutate({ steadfastEnabled, pathaoEnabled, redxEnabled });

  const saveLocalization = () =>
    updateMutation.mutate({
      ...(timezone ? { timezone } : {}),
      ...(dateFormat ? { dateFormat } : {}),
      ...(locale ? { locale } : {}),
    });

  const saveSeo = () => {
    if (ogImageFile) {
      uploadMutation.mutate(
        { ogImage: ogImageFile },
        {
          onSuccess: () => {
            setOgImageFile(null);
            updateMutation.mutate({
              ...(metaTitle ? { metaTitle } : {}),
              ...(metaDescription ? { metaDescription } : {}),
              ...(metaKeywords ? { metaKeywords } : {}),
              ...(googleAnalyticsId ? { googleAnalyticsId } : {}),
              ...(gtmId ? { gtmId } : {}),
              ...(facebookPixelId ? { facebookPixelId } : {}),
              robotsIndex,
            });
          },
        }
      );
    } else {
      updateMutation.mutate({
        ...(metaTitle ? { metaTitle } : {}),
        ...(metaDescription ? { metaDescription } : {}),
        ...(metaKeywords ? { metaKeywords } : {}),
        ...(googleAnalyticsId ? { googleAnalyticsId } : {}),
        ...(gtmId ? { gtmId } : {}),
        ...(facebookPixelId ? { facebookPixelId } : {}),
        robotsIndex,
      });
    }
  };

  const saveSystem = () =>
    updateMutation.mutate({
      maintenanceMode,
      ...(maintenanceMessage ? { maintenanceMessage } : {}),
      allowGuestCheckout,
      requirePhoneVerify,
      requireEmailVerify,
    });

  const isSaving = updateMutation.isPending || uploadMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-muted-foreground text-xs tracking-wider uppercase">
          Dashboard / Settings
        </p>
        <h1 className="font-heading text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage branding, business info, payments, and system configuration.
        </p>
      </div>

      <Tabs defaultValue="branding">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
          {[
            { value: "branding", icon: Settings2, label: "Branding" },
            { value: "business", icon: Building2, label: "Business" },
            { value: "social", icon: Share2, label: "Social" },
            { value: "commerce", icon: ShoppingCart, label: "Commerce" },
            { value: "shipping", icon: Truck, label: "Shipping" },
            { value: "payments", icon: CreditCard, label: "Payments" },
            { value: "localization", icon: Globe, label: "Localization" },
            { value: "seo", icon: Search, label: "SEO" },
            { value: "system", icon: Wrench, label: "System" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-[state=active]:bg-brand-gold rounded-md border px-3 py-1.5 text-xs font-medium transition-colors data-[state=active]:text-white"
            >
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── BRANDING ──────────────────────────────────────────────────────────── */}
        <TabsContent value="branding" className="mt-6">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <Section title="Store Identity">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Store name</Label>
                  <Input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Baby Bliss Boutique"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Tagline</Label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Your tagline here"
                  />
                </div>
              </div>
            </Section>

            <Section title="Brand Colors">
              <div className="grid gap-4 sm:grid-cols-3">
                <ColorField
                  label="Primary"
                  value={primaryColor}
                  onChange={setPrimaryColor}
                />
                <ColorField
                  label="Secondary"
                  value={secondaryColor}
                  onChange={setSecondaryColor}
                />
                <ColorField
                  label="Accent"
                  value={accentColor}
                  onChange={setAccentColor}
                />
              </div>
            </Section>

            <Section title="Logo & Favicon">
              <div className="grid gap-6 sm:grid-cols-3">
                <ImageUploadField
                  label="Logo (light)"
                  currentUrl={settings?.logoUrl}
                  file={logoFile}
                  onFileChange={setLogoFile}
                  hint="Shown on light backgrounds"
                />
                <ImageUploadField
                  label="Logo (dark)"
                  currentUrl={settings?.logoDarkUrl}
                  file={logoDarkFile}
                  onFileChange={setLogoDarkFile}
                  hint="Shown on dark backgrounds"
                />
                <ImageUploadField
                  label="Favicon"
                  currentUrl={settings?.faviconUrl}
                  file={faviconFile}
                  onFileChange={setFaviconFile}
                  hint="32×32 or 64×64 .ico / .png"
                />
              </div>
            </Section>

            <div className="flex justify-end">
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                onClick={saveBranding}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save branding"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── BUSINESS ──────────────────────────────────────────────────────────── */}
        <TabsContent value="business" className="mt-6">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <Section title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Business email
                  </Label>
                  <Input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="hello@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Support email</Label>
                  <Input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    WhatsApp number
                  </Label>
                  <Input
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
              </div>
            </Section>

            <Section title="Address">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Address line 1
                  </Label>
                  <Input
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Address line 2
                  </Label>
                  <Input
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Upazila</Label>
                  <Input value={upazila} onChange={(e) => setUpazila(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">District</Label>
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Division</Label>
                  <Input value={division} onChange={(e) => setDivision(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Postal code</Label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="BD"
                    maxLength={10}
                  />
                </div>
              </div>
            </Section>

            <Section title="Business Registration">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Trade license no.
                  </Label>
                  <Input
                    value={tradeLicenseNo}
                    onChange={(e) => setTradeLicenseNo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">TIN no.</Label>
                  <Input value={tinNo} onChange={(e) => setTinNo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">BIN no.</Label>
                  <Input value={binNo} onChange={(e) => setBinNo(e.target.value)} />
                </div>
              </div>
            </Section>

            <div className="flex justify-end">
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                onClick={saveBusiness}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save business info"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── SOCIAL ────────────────────────────────────────────────────────────── */}
        <TabsContent value="social" className="mt-6">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <Section title="Social Media Links">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Facebook",
                    value: facebookUrl,
                    set: setFacebookUrl,
                    placeholder: "https://facebook.com/yourpage",
                  },
                  {
                    label: "Instagram",
                    value: instagramUrl,
                    set: setInstagramUrl,
                    placeholder: "https://instagram.com/yourpage",
                  },
                  {
                    label: "YouTube",
                    value: youtubeUrl,
                    set: setYoutubeUrl,
                    placeholder: "https://youtube.com/@yourchannel",
                  },
                  {
                    label: "TikTok",
                    value: tiktokUrl,
                    set: setTiktokUrl,
                    placeholder: "https://tiktok.com/@yourpage",
                  },
                  {
                    label: "WhatsApp group",
                    value: whatsappGroupUrl,
                    set: setWhatsappGroupUrl,
                    placeholder: "https://chat.whatsapp.com/...",
                  },
                ].map(({ label, value, set, placeholder }) => (
                  <div key={label} className="space-y-2">
                    <Label className="text-xs font-semibold uppercase">{label}</Label>
                    <Input
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </Section>

            <div className="flex justify-end">
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                onClick={saveSocial}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save social links"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── COMMERCE ──────────────────────────────────────────────────────────── */}
        <TabsContent value="commerce" className="mt-6">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <Section title="Currency">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Currency code</Label>
                  <Input
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    placeholder="BDT"
                    maxLength={3}
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Currency symbol
                  </Label>
                  <Input
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="৳"
                    maxLength={5}
                  />
                </div>
              </div>
            </Section>

            <Section title="VAT / Tax">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    VAT rate (0–1)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    placeholder="0.15 = 15%"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="vatInclusive"
                      checked={vatInclusive}
                      onCheckedChange={(v) => setVatInclusive(v === true)}
                    />
                    <Label htmlFor="vatInclusive" className="text-sm font-normal">
                      VAT inclusive pricing
                    </Label>
                  </div>
                </div>
              </div>
            </Section>

            <div className="flex justify-end">
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                onClick={saveCommerce}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save commerce settings"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── SHIPPING ──────────────────────────────────────────────────────────── */}
        <TabsContent value="shipping" className="mt-6">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <Section title="Delivery Fees">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Inside Dhaka fee (BDT)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={insideDhakaFee}
                    onChange={(e) => setInsideDhakaFee(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Outside Dhaka fee (BDT)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={outsideDhakaFee}
                    onChange={(e) => setOutsideDhakaFee(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Free shipping threshold (BDT)
                    <span className="text-muted-foreground ml-1 font-normal normal-case">
                      optional
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    placeholder="Leave blank to disable"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Low stock threshold (units)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                </div>
              </div>
            </Section>

            <div className="flex justify-end">
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                onClick={saveShipping}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save shipping settings"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── PAYMENTS & COURIERS ───────────────────────────────────────────────── */}
        <TabsContent value="payments" className="mt-6">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <Section title="Payment Methods">
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  checked={codEnabled}
                  onChange={setCodEnabled}
                  label="Cash on Delivery"
                  description="Collect payment at doorstep"
                />
                <Toggle
                  checked={bkashEnabled}
                  onChange={setBkashEnabled}
                  label="bKash"
                  description="Mobile banking via bKash"
                />
                <Toggle
                  checked={nagadEnabled}
                  onChange={setNagadEnabled}
                  label="Nagad"
                  description="Mobile banking via Nagad"
                />
                <Toggle
                  checked={rocketEnabled}
                  onChange={setRocketEnabled}
                  label="Rocket"
                  description="Mobile banking via Rocket"
                />
                <Toggle
                  checked={sslCommerzEnabled}
                  onChange={setSslCommerzEnabled}
                  label="SSLCommerz"
                  description="Card & internet banking gateway"
                />
              </div>
            </Section>

            <div className="flex justify-end">
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                onClick={savePayments}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save payment methods"}
              </Button>
            </div>

            <Section title="Courier Integrations">
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  checked={steadfastEnabled}
                  onChange={setSteadfastEnabled}
                  label="Steadfast"
                  description="Steadfast courier integration"
                />
                <Toggle
                  checked={pathaoEnabled}
                  onChange={setPathaoEnabled}
                  label="Pathao"
                  description="Pathao courier integration"
                />
                <Toggle
                  checked={redxEnabled}
                  onChange={setRedxEnabled}
                  label="RedX"
                  description="RedX courier integration"
                />
              </div>
            </Section>

            <div className="flex justify-end">
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                onClick={saveCouriers}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save courier integrations"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── LOCALIZATION ──────────────────────────────────────────────────────── */}
        <TabsContent value="localization" className="mt-6">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <Section title="Regional Settings">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Timezone</Label>
                  <Input
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="Asia/Dhaka"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Date format</Label>
                  <Input
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Locale</Label>
                  <Input
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    placeholder="en-BD"
                  />
                </div>
              </div>
            </Section>

            <div className="flex justify-end">
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                onClick={saveLocalization}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save localization"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── SEO ───────────────────────────────────────────────────────────────── */}
        <TabsContent value="seo" className="mt-6">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <Section title="Meta Tags">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Meta title</Label>
                  <Input
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Baby Bliss Boutique — Premium Baby Clothing"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Meta description
                  </Label>
                  <Textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Shop premium baby clothing and accessories…"
                    maxLength={255}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">Meta keywords</Label>
                  <Input
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="baby clothes, baby boutique, kids fashion"
                    maxLength={255}
                  />
                </div>
              </div>
            </Section>

            <Section title="Open Graph Image">
              <ImageUploadField
                label="OG image"
                currentUrl={settings?.ogImageUrl}
                file={ogImageFile}
                onFileChange={setOgImageFile}
                hint="1200×630px recommended for social sharing previews"
              />
            </Section>

            <Section title="Analytics & Tracking">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Google Analytics ID
                  </Label>
                  <Input
                    value={googleAnalyticsId}
                    onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">GTM ID</Label>
                  <Input
                    value={gtmId}
                    onChange={(e) => setGtmId(e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Facebook Pixel ID
                  </Label>
                  <Input
                    value={facebookPixelId}
                    onChange={(e) => setFacebookPixelId(e.target.value)}
                    placeholder="000000000000000"
                    maxLength={50}
                  />
                </div>
              </div>
            </Section>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="robotsIndex"
                  checked={robotsIndex}
                  onCheckedChange={(v) => setRobotsIndex(v === true)}
                />
                <Label htmlFor="robotsIndex" className="text-sm font-normal">
                  Allow search engines to index this site
                </Label>
              </div>
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                onClick={saveSeo}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save SEO settings"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── SYSTEM ────────────────────────────────────────────────────────────── */}
        <TabsContent value="system" className="mt-6">
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <Section title="Maintenance">
              <Toggle
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
                label="Maintenance mode"
                description="When enabled, the storefront shows a maintenance message to visitors"
              />
              {maintenanceMode && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase">
                    Maintenance message
                  </Label>
                  <Textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="We're currently down for maintenance. We'll be back shortly."
                    rows={3}
                    maxLength={500}
                  />
                </div>
              )}
            </Section>

            <Section title="Checkout & Verification">
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  checked={allowGuestCheckout}
                  onChange={setAllowGuestCheckout}
                  label="Guest checkout"
                  description="Allow customers to order without an account"
                />
                <Toggle
                  checked={requirePhoneVerify}
                  onChange={setRequirePhoneVerify}
                  label="Require phone verification"
                  description="Customers must verify phone number"
                />
                <Toggle
                  checked={requireEmailVerify}
                  onChange={setRequireEmailVerify}
                  label="Require email verification"
                  description="Customers must verify email address"
                />
              </div>
            </Section>

            <div className="flex justify-end">
              <Button
                className={cn(
                  "text-white",
                  maintenanceMode
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-brand-gold hover:bg-brand-gold-dark"
                )}
                onClick={saveSystem}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save system settings"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-muted-foreground py-4 text-center text-xs tracking-widest uppercase">
        &copy; {new Date().getFullYear()} Baby Bliss Boutique | Settings
      </div>
    </div>
  );
}
