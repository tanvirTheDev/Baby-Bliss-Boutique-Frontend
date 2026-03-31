import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "./rating-stars";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  className?: string;
}

export function TestimonialCard({
  name,
  avatar,
  rating,
  comment,
  className,
}: TestimonialCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className={cn("bg-card", className)}>
      <CardContent className="space-y-4 p-6">
        <RatingStars rating={rating} showCount={false} />
        <p className="text-muted-foreground text-sm italic">&ldquo;{comment}&rdquo;</p>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium">{name}</p>
        </div>
      </CardContent>
    </Card>
  );
}
