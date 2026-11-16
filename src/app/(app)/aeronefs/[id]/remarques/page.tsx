import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { isChef } from "@/lib/auth";
import { aircraftAccess } from "@/lib/access";
import { completeRemarkAction, createRemarkAction } from "@/app/actions/ops";
import { AutoCheckForm } from "@/components/AutoCheckForm";
import { Btn, GhostLink, Input, Label, Select, Textarea } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const kinds = [
  { value: "TACHE", label: "Tâche" },
  { value: "CURA", label: "CURA" },
  { value: "TS", label: "TS" },
  { value: "REMARQUE", label: "Remarque" },
] as const;

export default async function RemarksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const aircraft = await aircraftAccess(user, id);
  if (!aircraft) notFound();
  const chef = isChef(user);

  const full = await prisma.aircraft.findUniqueOrThrow({
    where: { id },
    include: {
      remarks: {
        orderBy: { createdAt: "desc" },
        include: { createdBy: true },
      },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Remarques · {full.registration}</h1>
        <div className="flex flex-wrap gap-2">
          {chef && <GhostLink href="/remarques">Suivi chef</GhostLink>}
          <GhostLink href={`/aeronefs/${id}`}>Menu machine</GhostLink>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle remarque</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createRemarkAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="aircraftId" value={id} />
            <div>
              <Label>Type</Label>
              <Select name="kind" defaultValue="TACHE">
                {kinds.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Réf. (tâche / CURA / TS)</Label>
              <Input name="reference" />
            </div>
            <div className="sm:col-span-2">
              <Label>Texte</Label>
              <Textarea name="body" required />
            </div>
            <Btn type="submit">Ajouter</Btn>
          </form>
        </CardContent>
      </Card>
      <ul className="space-y-3">
        {full.remarks.map((r) => (
          <li
            key={r.id}
            className={`rounded-xl p-4 ring-1 ${
              r.done
                ? "bg-emerald-950/40 ring-emerald-700"
                : "bg-card ring-foreground/10"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary">
                  {r.kind}
                  {r.reference ? ` · ${r.reference}` : ""}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{r.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Saisie {r.createdBy.trigramme} ·{" "}
                  {r.createdAt.toLocaleDateString("fr-FR", { timeZone: "UTC" })}
                </p>
              </div>
              {chef ? (
                <AutoCheckForm
                  action={completeRemarkAction}
                  hidden={{ id: r.id }}
                  name="done"
                  defaultChecked={r.done}
                  label={`Faite · ${user.trigramme}`}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {r.done ? "Validée chef" : "En attente chef de visite"}
                </p>
              )}
            </div>
            {r.done && (
              <p className="mt-2 text-sm text-emerald-300">
                Validée {r.doneTrigramme} ·{" "}
                {r.doneAt?.toLocaleDateString("fr-FR", { timeZone: "UTC" })}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
