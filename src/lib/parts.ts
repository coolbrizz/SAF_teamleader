import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isChef, readSession } from "@/lib/auth";

export async function persistPartReceived(id: string, received: boolean) {
  const user = await readSession();
  if (!user || !isChef(user) || !id) return false;
  const part = await prisma.partRequest.update({
    where: { id },
    data: { received, receivedAt: received ? new Date() : null },
  });
  revalidatePath(`/aeronefs/${part.aircraftId}`);
  return true;
}
