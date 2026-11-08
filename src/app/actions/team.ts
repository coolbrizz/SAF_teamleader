"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { requireAdmin, requireChef } from "@/lib/guards";

function trigramme(v: string) {
  return v.trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
}

export async function createUserAction(formData: FormData) {
  const actor = await requireChef();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const tri = trigramme(String(formData.get("trigramme") ?? ""));
  let role = String(formData.get("role") ?? "MECANICIEN") as Role;
  const boxNumber = String(formData.get("boxNumber") ?? "").trim() || null;
  if (role === "ADMIN" || (!isAdmin(actor) && role !== "MECANICIEN")) {
    role = "MECANICIEN";
  }
  if (!email || password.length < 6 || !firstName || !lastName || tri.length !== 3) {
    redirect("/utilisateurs?e=1");
  }
  if (role === "MECANICIEN" && !boxNumber) {
    redirect("/utilisateurs?e=1");
  }
  try {
    await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        firstName,
        lastName,
        trigramme: tri,
        boxNumber,
        role,
      },
    });
  } catch {
    redirect("/utilisateurs?e=exists");
  }
  revalidatePath("/utilisateurs");
  redirect("/utilisateurs");
}

export async function createAircraftAction(formData: FormData) {
  await requireChef();
  const machineNumber = String(formData.get("machineNumber") ?? "").trim();
  const visitType = String(formData.get("visitType") ?? "").trim();
  const registration = String(formData.get("registration") ?? "").trim().toUpperCase();
  if (!machineNumber || !visitType || !registration) redirect("/aeronefs/nouveau?e=1");
  const a = await prisma.aircraft.create({
    data: { machineNumber, visitType, registration },
  });
  redirect(`/aeronefs/${a.id}`);
}

export async function assignMechanicAction(formData: FormData) {
  await requireChef();
  const aircraftId = String(formData.get("aircraftId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!aircraftId || !userId) return;
  await prisma.aircraftAssignment.upsert({
    where: { aircraftId_userId: { aircraftId, userId } },
    update: {},
    create: { aircraftId, userId },
  });
  revalidatePath(`/aeronefs/${aircraftId}`);
  revalidatePath(`/aeronefs/${aircraftId}/equipe`);
}

export async function unassignMechanicAction(formData: FormData) {
  await requireChef();
  const aircraftId = String(formData.get("aircraftId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  await prisma.aircraftAssignment.delete({
    where: { aircraftId_userId: { aircraftId, userId } },
  });
  revalidatePath(`/aeronefs/${aircraftId}`);
  revalidatePath(`/aeronefs/${aircraftId}/equipe`);
}

export async function setChefAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const makeChef = String(formData.get("chef") ?? "") === "1";
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "ADMIN") {
    redirect("/utilisateurs");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { role: makeChef ? "CHEF_VISITE" : "MECANICIEN" },
  });
  revalidatePath("/utilisateurs");
  redirect("/utilisateurs");
}

export async function deleteMechanicAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role !== "MECANICIEN") {
    redirect("/utilisateurs");
  }
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/utilisateurs");
  redirect("/utilisateurs");
}

export async function setAircraftArchivedAction(formData: FormData) {
  await requireChef();
  const aircraftId = String(formData.get("aircraftId") ?? "");
  const archive = String(formData.get("archive") ?? "") === "1";
  if (!aircraftId) redirect("/");
  await prisma.aircraft.update({
    where: { id: aircraftId },
    data: { archivedAt: archive ? new Date() : null },
  });
  revalidatePath("/");
  revalidatePath("/archives");
  revalidatePath(`/aeronefs/${aircraftId}`);
  redirect(archive ? "/archives" : `/aeronefs/${aircraftId}`);
}

export async function deleteAircraftAction(formData: FormData) {
  await requireChef();
  const aircraftId = String(formData.get("aircraftId") ?? "");
  if (!aircraftId) redirect("/");
  await prisma.aircraft.delete({ where: { id: aircraftId } });
  revalidatePath("/");
  revalidatePath("/archives");
  redirect("/");
}
