import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </label>
  );
}

const field =
  "min-h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none focus:border-primary";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(field, className)} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select {...props} className={cn(field, className)} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(field, "min-h-24 py-3", className)} />;
}

export function Btn({ children, className, ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border px-4 text-sm"
    >
      {children}
    </Link>
  );
}
