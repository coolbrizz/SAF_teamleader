import { redirect } from "next/navigation";
import { isAdmin, isChef, readSession, type SessionUser } from "./auth";

export async function requireUser(): Promise<SessionUser> {
  const user = await readSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireChef(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isChef(user)) redirect("/");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isAdmin(user)) redirect("/");
  return user;
}
