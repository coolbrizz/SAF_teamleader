import Link from "next/link";
import { ClipboardList, Helicopter, MessageSquare, Plus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { isChef } from "@/lib/auth";
import { MenuCard } from "@/components/MenuCard";

export default async function HomePage() {
  const user = await requireUser();
  const chef = isChef(user);

  const aircrafts = await prisma.aircraft.findMany({
    where: {
      archivedAt: null,
      ...(chef ? {} : { assignments: { some: { userId: user.id } } }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { parts: true, remarks: true } },
      assignments: { include: { user: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Hangar</p>
          <h1 className="text-2xl font-semibold">Choisir un aéronef</h1>
          <p className="text-muted-foreground">Touche une carte pour ouvrir le menu machine.</p>
        </div>
        {chef && (
          <Link
            href="/aeronefs/nouveau"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-5" />
            Nouvel aéronef
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {aircrafts.map((a) => (
          <MenuCard
            key={a.id}
            href={`/aeronefs/${a.id}`}
            icon={Helicopter}
            accent
            title={a.registration}
            description={`n° ${a.machineNumber} · ${a.visitType} · ${a._count.parts} PN · ${a.assignments.map((x) => x.user.trigramme).join(" ") || "aucun mécano"}`}
          />
        ))}
        {chef && (
          <MenuCard
            href="/remarques?etat=ouvertes"
            icon={MessageSquare}
            title="Suivi remarques"
            description="Chef d’équipe : validées / à valider (trigramme chef de visite)"
          />
        )}
        {chef && (
          <MenuCard
            href="/inventaires"
            icon={ClipboardList}
            title="Inventaires semaine"
            description="Vue chef : toutes les caisses de la semaine"
          />
        )}
        {chef && (
          <MenuCard
            href="/utilisateurs"
            icon={Users}
            title="Comptes"
            description="Créer un mécano ou un chef de visite"
          />
        )}
      </div>

      {aircrafts.length === 0 && !chef && (
        <p className="text-muted-foreground">
          Aucun aéronef affecté. Le chef de visite doit t’assigner sur une machine.
        </p>
      )}
    </div>
  );
}
