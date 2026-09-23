import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { isChef } from "@/lib/auth";
import { mondayOf } from "@/lib/access";
import { GhostLink } from "@/components/fields";
import { Card, CardContent } from "@/components/ui/card";

export default async function InventoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const user = await requireUser();
  const chef = isChef(user);
  const { week } = await searchParams;
  const start = week ? mondayOf(new Date(week)) : mondayOf(new Date());
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  const list = await prisma.inventory.findMany({
    where: {
      ...(chef ? {} : { mechanicId: user.id }),
      date: { gte: start, lt: end },
    },
    orderBy: { date: "desc" },
    include: { mechanic: true, aircraft: true },
  });

  const prev = new Date(start);
  prev.setUTCDate(prev.getUTCDate() - 7);
  const next = new Date(start);
  next.setUTCDate(next.getUTCDate() + 7);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Inventaires caisses</h1>
        <GhostLink href="/">Hangar</GhostLink>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href={`/inventaires?week=${iso(prev)}`}
          className="min-h-11 rounded-lg border border-border px-3 py-2"
        >
          Semaine −
        </Link>
        <span className="text-primary">
          Semaine du {start.toLocaleDateString("fr-FR", { timeZone: "UTC" })}
        </span>
        <Link
          href={`/inventaires?week=${iso(next)}`}
          className="min-h-11 rounded-lg border border-border px-3 py-2"
        >
          Semaine +
        </Link>
      </div>
      <Card>
        <CardContent>
          <ul className="divide-y divide-border">
            {list.map((i) => (
              <li key={i.id} className="py-3">
                <p className="font-medium">
                  Caisse {i.boxNumber}
                  {chef && (
                    <span className="text-primary">
                      {" "}
                      · {i.mechanic.trigramme} {i.mechanic.lastName}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {i.date.toLocaleDateString("fr-FR", { timeZone: "UTC" })} · signé {i.signature}
                  {i.aircraft ? ` · ${i.aircraft.registration}` : ""}
                </p>
                {i.observations && (
                  <p className="mt-1 whitespace-pre-wrap text-sm">{i.observations}</p>
                )}
              </li>
            ))}
            {list.length === 0 && (
              <li className="py-3 text-muted-foreground">Rien cette semaine.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
