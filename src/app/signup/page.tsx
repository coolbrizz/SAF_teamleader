import Link from "next/link";
import { registerMechanicAction } from "@/app/actions/auth";
import { Btn, Input, Label } from "@/components/fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-primary">
        Mécanicien
      </p>
      <h1 className="mb-6 text-3xl font-semibold">Inscription</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ton profil hangar</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={registerMechanicAction} className="space-y-4">
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
              <Input name="email" type="email" autoComplete="email" required />
            </div>
            <div>
              <Label>Trigramme (3 lettres)</Label>
              <Input name="trigramme" maxLength={3} required />
            </div>
            <div>
              <Label>N° de caisse</Label>
              <Input name="boxNumber" required />
            </div>
            <div>
              <Label>Mot de passe (≥ 6)</Label>
              <Input name="password" type="password" minLength={6} required />
            </div>
            {e === "exists" && (
              <p className="text-sm text-red-400">Mail ou trigramme déjà pris.</p>
            )}
            {e === "1" && (
              <p className="text-sm text-red-400">
                Tous les champs sont obligatoires (trigramme 3 lettres, mdp ≥ 6).
              </p>
            )}
            <Btn type="submit" className="w-full">
              S’inscrire
            </Btn>
          </form>
          <p className="mt-5 text-center text-sm">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-primary underline">
              Entrer
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
