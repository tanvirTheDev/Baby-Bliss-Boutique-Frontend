"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  variant?: "default" | "banner";
  className?: string;
}

export function NewsletterForm({ variant = "default", className }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  if (submitted) {
    return <p className="text-brand-success text-sm">Thank you for subscribing!</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex gap-2",
        variant === "banner" ? "mx-auto max-w-md" : "",
        className
      )}
    >
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        required
        className="flex-1"
      />
      <Button
        type="submit"
        size="icon"
        className="bg-brand-gold hover:bg-brand-gold-dark"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
