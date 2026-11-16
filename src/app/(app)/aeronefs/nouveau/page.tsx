import { createAircraftAction } from "@/app/actions/team";
import { requireChef } from "@/lib/guards";
import { Btn, GhostLink, Input, Label } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewAircraftPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  await requireChef();
  const { e } = await searchParams;
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nouvel aéronef</h1>
        <GhostLink href="/">Hangar</GhostLink>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Identification</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAircraftAction} className="space-y-4">
            <div>
              <Label>Numéro de machine</Label>
              <Input name="machineNumber" required />
            </div>
            <div>
              <Label>Type de visite</Label>
              <Input name="visitType" placeholder="1000h / 12 ans / …" required />
            </div>
            <div>
              <Label>Immatriculation</Label>
              <Input name="registration" placeholder="F-Hxxx" required />
            </div>
            {e && <p className="text-sm text-red-400">Champs incomplets.</p>}
            <Btn type="submit" className="w-full">
              Créer
            </Btn>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
