import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MessengerButton } from "@/components/layout/messenger-button";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MessengerButton />
    </>
  );
}
