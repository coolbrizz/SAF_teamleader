import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireChef } from "@/lib/guards";
import { aircraftAccess } from "@/lib/access";
import { assignMechanicAction, unassignMechanicAction } from "@/app/actions/team";
import { Btn, GhostLink, Select } from "@/components/fields";
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

  const [full, mechanics] = await Promise.all([
    prisma.aircraft.findUniqueOrThrow({
      where: { id },
      include: { assignments: { include: { user: true } } },
    }),
    prisma.user.findMany({
      where: { role: "MECANICIEN" },
      orderBy: { lastName: "asc" },
    }),
  ]);

  const assignedIds = new Set(full.assignments.map((a) => a.userId));
  const available = mechanics.filter((m) => !assignedIds.has(m.id));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Équipe · {full.registration}</h1>
        <GhostLink href={`/aeronefs/${id}`}>Menu machine</GhostLink>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Affectation mécanos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {full.assignments.map((a) => (
              <li key={a.userId} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {a.user.firstName} {a.user.lastName} ({a.user.trigramme})
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
          <form action={assignMechanicAction} className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="aircraftId" value={id} />
            <Select name="userId" required defaultValue="">
              <option value="" disabled>
                Choisir un mécano
              </option>
              {available.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.lastName} {m.firstName} · {m.trigramme}
                </option>
              ))}
            </Select>
            <Btn type="submit">Affecter</Btn>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
