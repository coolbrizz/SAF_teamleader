import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { isChef } from "@/lib/auth";
import { aircraftAccess } from "@/lib/access";
import {
  createPartAction,
  setDaAction,
  setReceivedAction,
} from "@/app/actions/ops";
import { AutoCheckForm } from "@/components/AutoCheckForm";
import { Btn, GhostLink, Input, Label } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PartsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ata?: string; tache?: string; e?: string }>;
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
      ...(q.ata ? { ata: { contains: q.ata, mode: "insensitive" } } : {}),
      ...(q.tache
        ? { taskRef: { contains: q.tache, mode: "insensitive" } }
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
          <p className="text-sm text-[#8B9BB4]">
            Ambre = commandée (DA) · Vert = reçue box
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
            <Label>Tâche de référence</Label>
            <Input name="taskRef" required />
          </div>
          <div>
            <Label>Quantité</Label>
            <Input name="quantity" type="number" min={1} defaultValue={1} required />
          </div>
          <div>
            <Label>ATA</Label>
            <Input name="ata" placeholder="25-60-00" required />
          </div>
          {q.e && <p className="text-sm text-red-400 sm:col-span-2">Champs incomplets.</p>}
          <Btn type="submit">Ajouter</Btn>
        </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
        <form className="mb-4 grid gap-3 sm:grid-cols-3" method="get">
          <div>
            <Label>Filtre ATA</Label>
            <Input name="ata" defaultValue={q.ata ?? ""} />
          </div>
          <div>
            <Label>Filtre tâche</Label>
            <Input name="tache" defaultValue={q.tache ?? ""} />
          </div>
          <div className="flex items-end">
            <Btn type="submit" className="w-full bg-[#121a2c] text-[#E8EEF8] border border-[#1e2a44]">
              Filtrer
            </Btn>
          </div>
        </form>

        <ul className="space-y-3">
          {parts.map((p) => {
            const cls = p.received
              ? "border-emerald-600 bg-emerald-950/50"
              : p.daNumber
                ? "border-[#F5C518] bg-[#F5C518]/10"
                : "border-[#1e2a44] bg-[#0B1220]";
            return (
              <li key={p.id} className={`rounded-lg border p-3 ${cls}`}>
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-mono text-lg text-[#F5C518]">{p.pn}</p>
                    <p className="text-sm">
                      ATA {p.ata} · tâche {p.taskRef} · qté {p.quantity}
                    </p>
                    <p className="text-xs text-[#8B9BB4]">
                      {p.createdBy.trigramme}
                      {p.daNumber ? ` · DA ${p.daNumber}` : " · non commandée"}
                    </p>
                  </div>
                  {chef && (
                    <div className="flex min-w-[220px] flex-col gap-2">
                      <form action={setDaAction} className="flex gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <Input
                          name="daNumber"
                          defaultValue={p.daNumber ?? ""}
                          placeholder="N° DA"
                        />
                        <Btn type="submit">DA</Btn>
                      </form>
                      <AutoCheckForm
                        action={setReceivedAction}
                        hidden={{ id: p.id }}
                        name="received"
                        defaultChecked={p.received}
                        label="Reçue box"
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {parts.length === 0 && (
            <li className="text-muted-foreground">Aucune pièce.</li>
          )}
        </ul>
        </CardContent>
      </Card>
    </div>
  );
}
