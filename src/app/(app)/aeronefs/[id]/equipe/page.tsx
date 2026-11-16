import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireChef } from "@/lib/guards";
import { aircraftAccess } from "@/lib/access";
import { assignMechanicAction, unassignMechanicAction } from "@/app/actions/team";
import { Btn, GhostLink } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EquipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireChef();
  const { id } = await params;
  const aircraft = await aircraftAccess(user, id);
  if (!aircraft) notFound();

  const [full, staff] = await Promise.all([
    prisma.aircraft.findUniqueOrThrow({
      where: { id },
      include: { assignments: { include: { user: true } } },
    }),
    prisma.user.findMany({
      where: { role: { in: ["MECANICIEN", "CHEF_VISITE"] } },
      orderBy: { lastName: "asc" },
    }),
  ]);

  const assignedIds = new Set(full.assignments.map((a) => a.userId));
  const available = staff.filter((m) => !assignedIds.has(m.id));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Équipe · {full.registration}</h1>
        <GhostLink href={`/aeronefs/${id}`}>Menu machine</GhostLink>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Déjà affectés</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {full.assignments.map((a) => (
              <li key={a.userId} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {a.user.lastName} {a.user.firstName} ({a.user.trigramme})
                  {a.user.role === "CHEF_VISITE" ? " · chef" : ""}
                </span>
                <form action={unassignMechanicAction}>
                  <input type="hidden" name="aircraftId" value={id} />
                  <input type="hidden" name="userId" value={a.userId} />
                  <button className="text-muted-foreground underline">Retirer</button>
                </form>
              </li>
            ))}
            {full.assignments.length === 0 && (
              <li className="text-muted-foreground">Personne affecté.</li>
            )}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>À affecter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {available.map((m) => (
            <form
              key={m.id}
              action={assignMechanicAction}
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
            >
              <input type="hidden" name="aircraftId" value={id} />
              <input type="hidden" name="userId" value={m.id} />
              <span className="text-sm">
                {m.lastName} {m.firstName} · {m.trigramme}
                {m.boxNumber ? ` · caisse ${m.boxNumber}` : ""}
                {m.role === "CHEF_VISITE" ? " · chef" : ""}
              </span>
              <Btn type="submit">Affecter</Btn>
            </form>
          ))}
          {available.length === 0 && staff.length > 0 && (
            <p className="text-sm text-muted-foreground">Tout le monde est déjà sur cette machine.</p>
          )}
          {staff.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun mécano / chef d’équipe en base. Crée-les dans Comptes ou via l’inscription.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
