"use client";

import { useSettingsContext } from "@/context/settings-context";

/**
 * Turns the configured Facebook page URL into a Messenger inbox link.
 *
 * Admins enter a page URL in settings, not an m.me link, so the page's
 * username has to be pulled out of whatever shape they pasted.
 *
 * @returns an m.me URL, or null when no usable page can be derived — in which
 *          case the button is not rendered at all rather than linking nowhere.
 */
export function messengerUrlFrom(facebookUrl: string | null | undefined): string | null {
  if (!facebookUrl) return null;

  const raw = facebookUrl.trim();
  if (!raw) return null;

  let parsed: URL;
  try {
    // Tolerate a bare "facebook.com/page" with no protocol.
    parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();

  // Already a Messenger link — use it as given.
  if (host === "m.me" || host.endsWith(".m.me")) return parsed.toString();

  if (!host.includes("facebook.com") && !host.includes("fb.com")) return null;

  // Numeric page ids arrive as /profile.php?id=123
  const profileId = parsed.searchParams.get("id");
  if (parsed.pathname.replace(/\/+$/, "").endsWith("/profile.php")) {
    return profileId ? `https://m.me/${profileId}` : null;
  }

  const slug = parsed.pathname.split("/").filter(Boolean)[0];
  if (!slug) return null;

  return `https://m.me/${slug}`;
}

export function MessengerButton() {
  const { settings } = useSettingsContext();
  const href = messengerUrlFrom(settings?.facebookUrl);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on Messenger"
      title="Chat with us on Messenger"
      className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#0078E7] focus-visible:ring-2 focus-visible:ring-[#0084FF] focus-visible:ring-offset-2 focus-visible:outline-none"
      style={{
        // Keep clear of the iOS home indicator.
        marginBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M12 2C6.5 2 2 6.14 2 11.25c0 2.88 1.42 5.44 3.65 7.13V22l3.34-1.83c.89.25 1.84.38 2.81.38 5.5 0 10-4.14 10-9.25S17.5 2 12 2zm1.04 12.46l-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82z" />
      </svg>
    </a>
  );
}
