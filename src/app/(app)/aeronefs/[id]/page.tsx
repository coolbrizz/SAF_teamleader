import { notFound } from "next/navigation";
import { ClipboardList, MessageSquare, Package, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { isChef } from "@/lib/auth";
import { aircraftAccess } from "@/lib/access";
import { setAircraftArchivedAction } from "@/app/actions/team";
import { DeleteAircraftButton } from "@/components/DeleteAircraftButton";
import { MenuCard } from "@/components/MenuCard";
import { GhostLink } from "@/components/fields";

export default async function AircraftHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const aircraft = await aircraftAccess(user, id);
  if (!aircraft) notFound();
  const chef = isChef(user);

  const [openRemarks, pendingParts] = await Promise.all([
    prisma.remark.count({ where: { aircraftId: id, done: false } }),
    prisma.partRequest.count({ where: { aircraftId: id, received: false } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Menu machine</p>
          <h1 className="text-2xl font-semibold">{aircraft.registration}</h1>
          <p className="text-muted-foreground">
            n° {aircraft.machineNumber} · visite {aircraft.visitType}
            {aircraft.archivedAt ? " · ARCHIVÉ" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chef && (
            <form action={setAircraftArchivedAction}>
              <input type="hidden" name="aircraftId" value={id} />
              <input
                type="hidden"
                name="archive"
                value={aircraft.archivedAt ? "0" : "1"}
              />
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border px-4 text-sm"
              >
                {aircraft.archivedAt ? "Sortir d’archive" : "Archiver (visite finie)"}
              </button>
            </form>
          )}
          {chef && (
            <DeleteAircraftButton aircraftId={id} registration={aircraft.registration} />
          )}
          <GhostLink href={aircraft.archivedAt ? "/archives" : "/"}>
            {aircraft.archivedAt ? "Archives" : "Changer d’aéronef"}
          </GhostLink>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <MenuCard
          href={`/aeronefs/${id}/inventaire`}
          icon={ClipboardList}
          title="Inventaire caisse"
          description="Saisie hebdo n° caisse, observations, signature trigramme"
        />
        <MenuCard
          href={`/aeronefs/${id}/pieces`}
          icon={Package}
          accent
          title="Commande de pièces"
          description={`${pendingParts} pièce(s) pas encore reçue(s)`}
        />
        <MenuCard
          href={`/aeronefs/${id}/remarques`}
          icon={MessageSquare}
          title="Remarques"
          description={`${openRemarks} ouverte(s) — tâche, CURA, TS`}
        />
        {chef && (
          <MenuCard
            href={`/aeronefs/${id}/equipe`}
            icon={Users}
            title="Affecter des mécanos"
            description="Chef de visite : équipe sur cette machine"
          />
        )}
      </div>
    </div>
  );
}
