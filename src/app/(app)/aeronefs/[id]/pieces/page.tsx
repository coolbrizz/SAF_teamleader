import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { isChef } from "@/lib/auth";
import { aircraftAccess } from "@/lib/access";
import { ATA_CHAPTERS, TASK_KINDS } from "@/lib/ata";
import { createPartAction } from "@/app/actions/ops";
import { PartRow } from "@/components/PartRow";
import { Btn, GhostLink, Input, Label, Select } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PartsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ata?: string; tache?: string; kind?: string; e?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const q = await searchParams;
  const aircraft = await aircraftAccess(user, id);
  if (!aircraft) notFound();
  const chef = isChef(user);

  const parts = await prisma.partRequest.findMany({
    where: {
      aircraftId: id,
      ...(q.ata ? { ata: q.ata } : {}),
      ...(q.kind === "TACHE" || q.kind === "OE" || q.kind === "TS"
        ? { taskKind: q.kind }
        : {}),
      ...(q.tache
        ? { taskRef: { contains: q.tache } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { createdBy: true },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pièces · {aircraft.registration}</h1>
          <p className="text-sm text-muted-foreground">
            Ambre / orange = DA saisie · Vert = reçue box
          </p>
        </div>
        <GhostLink href={`/aeronefs/${id}`}>Menu machine</GhostLink>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demander une pièce</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPartAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="aircraftId" value={id} />
            <div>
              <Label>PN</Label>
              <Input name="pn" required />
            </div>
            <div>
              <Label>Référence</Label>
              <div className="flex gap-2">
                <Select name="taskKind" defaultValue="TACHE" className="max-w-32">
                  {TASK_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </Select>
                <Input name="taskRef" placeholder="N° tâche / OE / TS" required />
              </div>
            </div>
            <div>
              <Label>Quantité</Label>
              <Input name="quantity" type="number" min={1} defaultValue={1} required />
            </div>
            <div>
              <Label>ATA</Label>
              <Select name="ata" required defaultValue="">
                <option value="" disabled>
                  Chapitre ATA
                </option>
                {ATA_CHAPTERS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.label}
                  </option>
                ))}
              </Select>
            </div>
            {q.e && <p className="text-sm text-red-400 sm:col-span-2">Champs incomplets.</p>}
            <Btn type="submit">Ajouter</Btn>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <form className="mb-4 grid gap-3 sm:grid-cols-4" method="get">
            <div>
              <Label>Filtre ATA</Label>
              <Select name="ata" defaultValue={q.ata ?? ""}>
                <option value="">Tous</option>
                {ATA_CHAPTERS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Type réf.</Label>
              <Select name="kind" defaultValue={q.kind ?? ""}>
                <option value="">Tous</option>
                {TASK_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>N° réf.</Label>
              <Input name="tache" defaultValue={q.tache ?? ""} />
            </div>
            <div className="flex items-end">
              <Btn type="submit" className="w-full border border-border bg-card text-foreground">
                Filtrer
              </Btn>
            </div>
          </form>

          <ul className="space-y-2">
            {parts.map((p) => (
              <PartRow
                key={p.id}
                chef={chef}
                part={{
                  id: p.id,
                  pn: p.pn,
                  ata: p.ata,
                  taskKind: p.taskKind,
                  taskRef: p.taskRef,
                  quantity: p.quantity,
                  daNumber: p.daNumber,
                  received: p.received,
                  createdBy: { trigramme: p.createdBy.trigramme },
                }}
              />
            ))}
            {parts.length === 0 && (
              <li className="text-muted-foreground">Aucune pièce.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
