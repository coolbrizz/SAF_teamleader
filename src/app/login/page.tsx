import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Btn, Input, Label } from "@/components/fields";
import { Card, CardContent } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-primary">
        Carnet de piste
      </p>
      <h1 className="mb-6 text-3xl font-semibold">SAF Teamleader</h1>
      <Card>
        <CardContent>
          <form action={loginAction} className="space-y-4">
            <div>
              <Label>Mail</Label>
              <Input name="email" type="text" autoComplete="username" required />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {e === "db" && (
              <p className="text-sm text-red-400">
                Base MySQL inaccessible. Vérifie DATABASE_URL (un @ dans le mot de passe
                doit être écrit %40).
              </p>
            )}
            {e === "1" && <p className="text-sm text-red-400">Identifiants incorrects.</p>}
            <Btn type="submit" className="w-full">
              Entrer
            </Btn>
          </form>
          <p className="mt-5 text-center text-sm">
            Pas encore inscrit ?{" "}
            <Link href="/signup" className="font-medium text-primary underline">
              Créer un compte mécano
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
