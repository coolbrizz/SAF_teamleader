import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { aircraftAccess } from "@/lib/access";
import { ATA_CHAPTERS } from "@/lib/ata";

const ATA_CODES = new Set<string>(ATA_CHAPTERS.map((c) => c.code));

export async function persistAtaDone(aircraftId: string, ata: string, done: boolean) {
  const user = await readSession();
  if (!user || !aircraftId || !ATA_CODES.has(ata)) return false;
  const aircraft = await aircraftAccess(user, aircraftId);
  if (!aircraft) return false;
  await prisma.ataStatus.upsert({
    where: { aircraftId_ata: { aircraftId, ata } },
    update: { done, doneAt: done ? new Date() : null },
    create: { aircraftId, ata, done, doneAt: done ? new Date() : null },
  });
  revalidatePath(`/aeronefs/${aircraftId}`);
  return true;
}
