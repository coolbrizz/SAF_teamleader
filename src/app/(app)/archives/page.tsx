import { Archive } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireChef } from "@/lib/guards";
import { MenuCard } from "@/components/MenuCard";
import { GhostLink } from "@/components/fields";

export default async function ArchivesPage() {
  await requireChef();
  const aircrafts = await prisma.aircraft.findMany({
    where: { archivedAt: { not: null } },
    orderBy: { archivedAt: "desc" },
    include: {
      _count: { select: { parts: true, remarks: true } },
      assignments: { include: { user: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Hangar</p>
          <h1 className="text-2xl font-semibold">Archives</h1>
          <p className="text-muted-foreground">Visites terminées — lecture + désarchivage chef.</p>
        </div>
        <GhostLink href="/">Hangar actif</GhostLink>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {aircrafts.map((a) => (
          <MenuCard
            key={a.id}
            href={`/aeronefs/${a.id}`}
            icon={Archive}
            title={a.registration}
            description={`n° ${a.machineNumber} · ${a.visitType} · archivé ${a.archivedAt?.toLocaleDateString("fr-FR", { timeZone: "UTC" })}`}
          />
        ))}
      </div>
      {aircrafts.length === 0 && (
        <p className="text-muted-foreground">Aucune machine archivée.</p>
      )}
    </div>
  );
}
