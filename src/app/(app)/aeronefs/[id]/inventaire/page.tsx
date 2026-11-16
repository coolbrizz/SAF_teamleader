import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { aircraftAccess } from "@/lib/access";
import { createInventoryAction } from "@/app/actions/ops";
import { Btn, GhostLink, Input, Label, Textarea } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AircraftInventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { e } = await searchParams;
  const aircraft = await aircraftAccess(user, id);
  if (!aircraft) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const [list, profile] = await Promise.all([
    prisma.inventory.findMany({
      where: { aircraftId: id },
      orderBy: { date: "desc" },
      take: 20,
      include: { mechanic: true },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Inventaire · {aircraft.registration}</h1>
        <GhostLink href={`/aeronefs/${id}`}>Menu machine</GhostLink>
      </div>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Saisie hebdo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createInventoryAction} className="space-y-4">
            <input type="hidden" name="aircraftId" value={id} />
            <div>
              <Label>N° de caisse</Label>
              <Input name="boxNumber" defaultValue={profile.boxNumber ?? ""} required />
            </div>
            <div>
              <Label>Date</Label>
              <Input name="date" type="date" defaultValue={today} required />
            </div>
            <div>
              <Label>Observations</Label>
              <Textarea name="observations" />
            </div>
            <p className="text-sm text-muted-foreground">
              Signature : <span className="text-primary">{user.trigramme}</span>
            </p>
            {e && <p className="text-sm text-red-400">Champs incomplets.</p>}
            <Btn type="submit" className="w-full">
              Enregistrer
            </Btn>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dernières saisies</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {list.map((i) => (
              <li key={i.id} className="py-3">
                <p className="font-medium">
                  Caisse {i.boxNumber} · {i.mechanic.trigramme}
                </p>
                <p className="text-sm text-muted-foreground">
                  {i.date.toLocaleDateString("fr-FR", { timeZone: "UTC" })} · signé {i.signature}
                </p>
                {i.observations && (
                  <p className="mt-1 whitespace-pre-wrap text-sm">{i.observations}</p>
                )}
              </li>
            ))}
            {list.length === 0 && (
              <li className="py-3 text-muted-foreground">Rien pour cette machine.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
