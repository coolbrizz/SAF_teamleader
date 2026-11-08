import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireChef } from "@/lib/guards";
import { completeRemarkAction } from "@/app/actions/ops";
import { AutoCheckForm } from "@/components/AutoCheckForm";
import { GhostLink } from "@/components/fields";
import { Card, CardContent } from "@/components/ui/card";

export default async function RemarksFollowUpPage({
  searchParams,
}: {
  searchParams: Promise<{ etat?: string }>;
}) {
  const user = await requireChef();
  const { etat } = await searchParams;
  const filter = etat === "validees" ? true : etat === "ouvertes" ? false : undefined;

  const [open, done, remarks] = await Promise.all([
    prisma.remark.count({ where: { done: false } }),
    prisma.remark.count({ where: { done: true } }),
    prisma.remark.findMany({
      where: filter === undefined ? {} : { done: filter },
      orderBy: { createdAt: "desc" },
      include: { aircraft: true, createdBy: true },
    }),
  ]);

  const tab = (href: string, label: string, on: boolean) => (
    <Link
      href={href}
      className={`min-h-11 rounded-lg px-3 py-2 text-sm ${
        on ? "bg-secondary text-primary" : "border border-border"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Suivi remarques</h1>
          <p className="text-sm text-muted-foreground">
            {open} à valider · {done} validée(s) (trigramme chef)
          </p>
        </div>
        <GhostLink href="/">Hangar</GhostLink>
      </div>
      <div className="flex flex-wrap gap-2">
        {tab("/remarques", "Toutes", !etat)}
        {tab("/remarques?etat=ouvertes", `À valider (${open})`, etat === "ouvertes")}
        {tab("/remarques?etat=validees", `Validées (${done})`, etat === "validees")}
      </div>
      <Card>
        <CardContent>
          <ul className="divide-y divide-border">
            {remarks.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/aeronefs/${r.aircraftId}/remarques`}
                    className="font-medium text-primary"
                  >
                    {r.aircraft.registration}
                  </Link>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {r.kind}
                    {r.reference ? ` · ${r.reference}` : ""} · saisie {r.createdBy.trigramme}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{r.body}</p>
                  {r.done && (
                    <p className="mt-1 text-sm text-emerald-300">
                      Validée {r.doneTrigramme} ·{" "}
                      {r.doneAt?.toLocaleDateString("fr-FR", { timeZone: "UTC" })}
                    </p>
                  )}
                </div>
                <AutoCheckForm
                  action={completeRemarkAction}
                  hidden={{ id: r.id }}
                  name="done"
                  defaultChecked={r.done}
                  label={`Faite · ${user.trigramme}`}
                />
              </li>
            ))}
            {remarks.length === 0 && (
              <li className="py-3 text-muted-foreground">Rien dans ce filtre.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
