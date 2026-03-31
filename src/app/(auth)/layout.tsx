import { siteConfig } from "@/config/site";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen">{children}</div>;
}
