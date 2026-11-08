"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { clearSessionCookie, setSessionCookie, signSession } from "@/lib/auth";
import { ensureSeed } from "@/lib/ensure-seed";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    await ensureSeed();
  } catch (err) {
    console.error("ensureSeed", err);
    redirect("/login?e=db");
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/login?e=1");
  }
  await setSessionCookie(
    await signSession({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      trigramme: user.trigramme,
      role: user.role,
    }),
  );
  redirect("/");
}

function trigramme(v: string) {
  return v.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
}

export async function registerMechanicAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const tri = trigramme(String(formData.get("trigramme") ?? ""));
  const boxNumber = String(formData.get("boxNumber") ?? "").trim();
  if (!email || password.length < 6 || !firstName || !lastName || tri.length !== 3 || !boxNumber) {
    redirect("/signup?e=1");
  }
  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        trigramme: tri,
        boxNumber,
        role: "MECANICIEN",
      },
    });
    await setSessionCookie(
      await signSession({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        trigramme: user.trigramme,
        role: user.role,
      }),
    );
  } catch {
    redirect("/signup?e=exists");
  }
  redirect("/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
  const session = await requireUser();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const boxNumber = String(formData.get("boxNumber") ?? "").trim();
  if (!firstName || !lastName || (session.role === "MECANICIEN" && !boxNumber)) {
    redirect("/profil?e=1");
  }
  const user = await prisma.user.update({
    where: { id: session.id },
    data: { firstName, lastName, boxNumber: boxNumber || null },
  });
  await setSessionCookie(
    await signSession({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      trigramme: user.trigramme,
      role: user.role,
    }),
  );
  revalidatePath("/profil");
  redirect("/profil?ok=1");
}
