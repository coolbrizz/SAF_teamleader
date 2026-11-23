import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { isChef } from "@/lib/auth";
import { aircraftAccess } from "@/lib/access";
import { TASK_KINDS } from "@/lib/ata";
import { createPartAction } from "@/app/actions/ops";
import { PartRow } from "@/components/PartRow";
import { Btn, GhostLink, Input, Label, Select } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PartsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ etat?: string; da?: string; e?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const q = await searchParams;
  const aircraft = await aircraftAccess(user, id);
  if (!aircraft) notFound();
  const chef = isChef(user);
  const etat = q.etat === "commande" || q.etat === "recue" || q.etat === "non" ? q.etat : "";
  const da = (q.da ?? "").trim();

  const [parts, daRows] = await Promise.all([
    prisma.partRequest.findMany({
      where: {
        aircraftId: id,
        ...(da ? { daNumber: da } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { createdBy: true },
    }),
    prisma.partRequest.findMany({
      where: { aircraftId: id },
      select: { daNumber: true },
    }),
  ]);

  const das = [...new Set(daRows.map((r) => (r.daNumber ?? "").trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "fr", { numeric: true }),
  );

  if (etat) {
    const rank = (p: (typeof parts)[number]) => {
      const ordered = Boolean((p.daNumber ?? "").trim());
      if (etat === "recue") return p.received ? 0 : 1;
      if (etat === "commande") return !p.received && ordered ? 0 : 1;
      return !p.received && !ordered ? 0 : 1;
    };
    parts.sort((a, b) => rank(a) - rank(b));
  }

  const listHref = (next: { etat?: string; da?: string }) => {
    const p = new URLSearchParams();
    if (next.etat) p.set("etat", next.etat);
    if (next.da) p.set("da", next.da);
    const s = p.toString();
    return `/aeronefs/${id}/pieces${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pièces · {aircraft.registration}</h1>
          <p className="text-sm text-muted-foreground">
            Jaune = DA validée · Orange = reçu partiel · Vert = tout reçu
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
                <Select name="taskKind" defaultValue="OE" className="max-w-32">
                  {TASK_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </Select>
                <Input name="taskRef" placeholder="N° OE / CURA / TS" required />
              </div>
            </div>
            <div>
              <Label>Dénomination</Label>
              <Input name="designation" autoComplete="off" required />
            </div>
            <div>
              <Label>Quantité</Label>
              <Input name="quantity" type="number" min={1} defaultValue={1} required />
            </div>
            {q.e && <p className="text-sm text-red-400 sm:col-span-2">Champs incomplets.</p>}
            <Btn type="submit">Ajouter</Btn>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-end gap-2">
            {(
              [
                ["recue", "Reçues", "bg-emerald-600 text-white"],
                ["commande", "Commandées", "bg-[#F5C518] text-[#0B1220]"],
                ["non", "Non commandées", "bg-card text-foreground"],
              ] as const
            ).map(([key, label, on]) => (
              <Link
                key={key}
                href={listHref({ etat: etat === key ? "" : key, da })}
                className={`inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold ring-1 ring-border ${etat === key ? on : "bg-background text-foreground"}`}
              >
                {label}
              </Link>
            ))}
            <form method="get" className="flex items-end gap-2">
              {etat ? <input type="hidden" name="etat" value={etat} /> : null}
              <div>
                <Label>DA</Label>
                <Select name="da" defaultValue={da}>
                  <option value="">Toutes</option>
                  {das.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </div>
              <Btn type="submit" className="border border-border bg-card text-foreground">
                Voir
              </Btn>
            </form>
          </div>

          <ul className="space-y-2">
            {parts.map((p) => (
              <PartRow
                key={p.id}
                chef={chef}
                part={{
                  id: p.id,
                  pn: p.pn,
                  taskKind: p.taskKind,
                  taskRef: p.taskRef,
                  quantity: p.quantity,
                  designation: p.designation,
                  daNumber: p.daNumber,
                  receivedQty: p.receivedQty,
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
