import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { updateProfileAction } from "@/app/actions/auth";
import { Btn, GhostLink, Input, Label } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; ok?: string }>;
}) {
  const session = await requireUser();
  const { e, ok } = await searchParams;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mon profil</h1>
        <GhostLink href="/">Hangar</GhostLink>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {user.trigramme}
            {user.role === "ADMIN"
              ? " · admin hangar"
              : user.role === "CHEF_VISITE"
                ? " · chef d’équipe"
                : " · mécano"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="space-y-4">
            <div>
              <Label>Prénom</Label>
              <Input name="firstName" defaultValue={user.firstName} required />
            </div>
            <div>
              <Label>Nom</Label>
              <Input name="lastName" defaultValue={user.lastName} required />
            </div>
            <div>
              <Label>Mail</Label>
              <Input defaultValue={user.email} disabled />
            </div>
            <div>
              <Label>N° de caisse</Label>
              <Input
                name="boxNumber"
                defaultValue={user.boxNumber ?? ""}
                required={user.role === "MECANICIEN"}
              />
            </div>
            {e && <p className="text-sm text-red-400">Champs incomplets.</p>}
            {ok && <p className="text-sm text-emerald-400">Profil enregistré.</p>}
            <Btn type="submit" className="w-full">
              Enregistrer
            </Btn>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
