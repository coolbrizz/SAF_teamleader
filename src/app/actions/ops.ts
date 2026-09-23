"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/guards";
import { isChef } from "@/lib/auth";

export async function createInventoryAction(formData: FormData) {
  const session = await requireUser();
  const profile = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  const boxNumber =
    String(formData.get("boxNumber") ?? "").trim() || profile.boxNumber?.trim() || "";
  const date = String(formData.get("date") ?? "");
  const observations = String(formData.get("observations") ?? "").trim();
  const aircraftId = String(formData.get("aircraftId") ?? "") || null;
  if (!boxNumber || !date) {
    redirect(aircraftId ? `/aeronefs/${aircraftId}/inventaire?e=1` : "/inventaires?e=1");
  }
  await prisma.inventory.create({
    data: {
      mechanicId: session.id,
      aircraftId,
      boxNumber,
      date: new Date(date),
      observations,
      signature: session.trigramme,
    },
  });
  revalidatePath("/inventaires");
  if (aircraftId) {
    revalidatePath(`/aeronefs/${aircraftId}/inventaire`);
    redirect(`/aeronefs/${aircraftId}/inventaire`);
  }
  redirect("/inventaires");
}

export async function createPartAction(formData: FormData) {
  const user = await requireUser();
  const aircraftId = String(formData.get("aircraftId") ?? "");
  const pn = String(formData.get("pn") ?? "").trim();
  const taskRef = String(formData.get("taskRef") ?? "").trim();
  const ata = String(formData.get("ata") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 0);
  if (!aircraftId || !pn || !taskRef || !ata || !quantity) {
    redirect(`/aeronefs/${aircraftId}/pieces?e=1`);
  }
  await prisma.partRequest.create({
    data: { aircraftId, createdById: user.id, pn, taskRef, ata, quantity },
  });
  revalidatePath(`/aeronefs/${aircraftId}/pieces`);
  revalidatePath(`/aeronefs/${aircraftId}`);
  redirect(`/aeronefs/${aircraftId}/pieces`);
}

export async function setDaAction(formData: FormData) {
  const user = await requireUser();
  if (!isChef(user)) return;
  const id = String(formData.get("id") ?? "");
  const daNumber = String(formData.get("daNumber") ?? "").trim();
  const part = await prisma.partRequest.update({
    where: { id },
    data: { daNumber, orderedAt: daNumber ? new Date() : null },
  });
  revalidatePath(`/aeronefs/${part.aircraftId}/pieces`);
}

export async function setReceivedAction(formData: FormData) {
  const user = await requireUser();
  if (!isChef(user)) return;
  const id = String(formData.get("id") ?? "");
  const received = String(formData.get("received") ?? "") === "on";
  const part = await prisma.partRequest.update({
    where: { id },
    data: { received, receivedAt: received ? new Date() : null },
  });
  revalidatePath(`/aeronefs/${part.aircraftId}/pieces`);
}

export async function createRemarkAction(formData: FormData) {
  const user = await requireUser();
  const aircraftId = String(formData.get("aircraftId") ?? "");
  const kind = String(formData.get("kind") ?? "REMARQUE") as
    | "TACHE"
    | "CURA"
    | "TS"
    | "REMARQUE";
  const reference = String(formData.get("reference") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  if (!aircraftId || !body) return;
  await prisma.remark.create({
    data: { aircraftId, createdById: user.id, kind, reference, body },
  });
  revalidatePath(`/aeronefs/${aircraftId}`);
  revalidatePath(`/aeronefs/${aircraftId}/remarques`);
}

export async function completeRemarkAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const done = String(formData.get("done") ?? "") === "on";
  const remark = await prisma.remark.update({
    where: { id },
    data: done
      ? {
          done: true,
          doneAt: new Date(),
          doneById: user.id,
          doneTrigramme: user.trigramme,
        }
      : { done: false, doneAt: null, doneById: null, doneTrigramme: null },
  });
  revalidatePath(`/aeronefs/${remark.aircraftId}`);
  revalidatePath(`/aeronefs/${remark.aircraftId}/remarques`);
}
