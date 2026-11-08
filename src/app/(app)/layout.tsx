import { Nav } from "@/components/Nav";
import { ArchiveFab } from "@/components/ArchiveFab";
import { requireUser } from "@/lib/guards";
import { isChef } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="min-h-dvh">
      <Nav user={user} />
      <div className="mx-auto max-w-6xl px-4 py-6 pb-24">{children}</div>
      {isChef(user) && <ArchiveFab />}
    </div>
  );
}
