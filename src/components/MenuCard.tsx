import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MenuCard({
  href,
  title,
  description,
  icon: Icon,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card
        className={cn(
          "h-full min-h-36 transition-colors hover:bg-accent active:translate-y-px",
          accent && "ring-primary/50",
        )}
      >
        <CardHeader className="gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Icon className="size-6" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
