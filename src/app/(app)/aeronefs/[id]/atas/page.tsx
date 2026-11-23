import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { aircraftAccess } from "@/lib/access";
import { ATA_CHAPTERS } from "@/lib/ata";
import { claimAtaAction, releaseAtaAction } from "@/app/actions/ops";
import { Btn, GhostLink } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AtasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const aircraft = await aircraftAccess(user, id);
  if (!aircraft) notFound();

  const [rows, staff] = await Promise.all([
    prisma.ataAssignment.findMany({
      where: { aircraftId: id },
      include: { user: { select: { trigramme: true } } },
    }),
    prisma.user.findMany({
      select: { id: true, trigramme: true },
      orderBy: { trigramme: "asc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">ATA · {aircraft.registration}</h1>
        <GhostLink href={`/aeronefs/${id}`}>Menu machine</GhostLink>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Affecter un trigramme</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {ATA_CHAPTERS.map((chapter) => {
              const assigned = rows
                .filter((row) => row.ata === chapter.code)
                .sort((a, b) => a.user.trigramme.localeCompare(b.user.trigramme, "fr"));
              return (
                <li
                  key={chapter.code}
                  className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-2 ring-1 ring-border"
                >
                  <span className="w-64 text-sm">{chapter.label}</span>
                  <form action={claimAtaAction} className="flex items-center gap-2">
                    <input type="hidden" name="aircraftId" value={id} />
                    <input type="hidden" name="ata" value={chapter.code} />
                    <select
                      name="userId"
                      defaultValue={user.id}
                      className="h-10 rounded-lg border border-input bg-background px-2 text-sm"
                    >
                      {staff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.trigramme}
                        </option>
                      ))}
                    </select>
                    <Btn type="submit" className="min-h-10 px-3">
                      Affecter
                    </Btn>
                  </form>
                  {assigned.map((row) => (
                    <form key={row.id} action={releaseAtaAction} className="flex items-center gap-1 text-sm">
                      <input type="hidden" name="id" value={row.id} />
                      <span>{row.user.trigramme}</span>
                      <button className="text-muted-foreground underline">Retirer</button>
                    </form>
                  ))}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
