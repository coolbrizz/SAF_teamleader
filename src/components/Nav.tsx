import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export function Nav({ user }: { user: SessionUser }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-auto font-semibold tracking-wide text-primary">
          SAF Teamleader
        </Link>
        <Link
          href="/profil"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {user.firstName} {user.lastName} · {user.trigramme}
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm"
          >
            Sortir
          </button>
        </form>
      </div>
    </header>
  );
}
