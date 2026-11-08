import Link from "next/link";
import { Archive } from "lucide-react";

export function ArchiveFab() {
  return (
    <Link
      href="/archives"
      aria-label="Archives"
      className="fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-black/20"
    >
      <Archive className="size-6" />
    </Link>
  );
}
