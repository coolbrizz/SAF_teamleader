import { prisma } from "@/lib/prisma";
import { requireChef } from "@/lib/guards";
import { isAdmin } from "@/lib/auth";
import {
  createUserAction,
  deleteMechanicAction,
  setChefAction,
} from "@/app/actions/team";
import { Btn, GhostLink, Input, Label, Select } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function roleLabel(role: string) {
  if (role === "ADMIN") return "Admin hangar";
  if (role === "CHEF_VISITE") return "Chef d’équipe";
  return "Mécano";
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const actor = await requireChef();
  const admin = isAdmin(actor);
  const { e } = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { lastName: "asc" } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Comptes</h1>
        <GhostLink href="/">Hangar</GhostLink>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nouveau profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUserAction} className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Prénom</Label>
              <Input name="firstName" required />
            </div>
            <div>
              <Label>Nom</Label>
              <Input name="lastName" required />
            </div>
            <div>
              <Label>Mail</Label>
              <Input name="email" type="email" required />
            </div>
            <div>
              <Label>Trigramme (3 lettres)</Label>
              <Input name="trigramme" maxLength={3} required />
            </div>
            <div>
              <Label>N° de caisse (mécano)</Label>
              <Input name="boxNumber" />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input name="password" type="password" minLength={6} required />
            </div>
            {admin && (
              <div>
                <Label>Rôle</Label>
                <Select name="role" defaultValue="MECANICIEN">
                  <option value="MECANICIEN">Mécanicien</option>
                  <option value="CHEF_VISITE">Chef d’équipe</option>
                </Select>
              </div>
            )}
            {e === "exists" && (
              <p className="text-sm text-red-400 sm:col-span-2">Mail ou trigramme déjà pris.</p>
            )}
            {e === "1" && (
              <p className="text-sm text-red-400 sm:col-span-2">
                Vérifie mail / mdp ≥ 6 / trigramme 3 lettres / n° caisse pour un mécano.
              </p>
            )}
            <Btn type="submit">Créer le compte</Btn>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <ul className="divide-y divide-border">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                  {u.lastName} {u.firstName}{" "}
                  <span className="text-primary">{u.trigramme}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {roleLabel(u.role)}
                    {u.boxNumber ? ` · caisse ${u.boxNumber}` : ""} · {u.email}
                  </span>
                </span>
                {admin && u.role !== "ADMIN" && (
                  <span className="flex flex-wrap gap-2">
                    {u.role === "MECANICIEN" ? (
                      <form action={setChefAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="chef" value="1" />
                        <button className="min-h-11 rounded-lg border border-border px-3 text-primary">
                          Nommer chef d’équipe
                        </button>
                      </form>
                    ) : (
                      <form action={setChefAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="chef" value="0" />
                        <button className="min-h-11 rounded-lg border border-border px-3">
                          Rétrograder mécano
                        </button>
                      </form>
                    )}
                    {u.role === "MECANICIEN" && (
                      <form action={deleteMechanicAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="min-h-11 rounded-lg border border-red-800 px-3 text-red-400">
                          Supprimer
                        </button>
                      </form>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
