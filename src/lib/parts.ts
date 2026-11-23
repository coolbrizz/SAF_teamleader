import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isChef, readSession } from "@/lib/auth";

export async function persistPartReceivedQty(id: string, receivedQty: number) {
  const user = await readSession();
  if (!user || !isChef(user) || !id) return false;
  const current = await prisma.partRequest.findUnique({
    where: { id },
    select: { quantity: true, aircraftId: true },
  });
  if (!current) return false;
  const qty = Math.max(0, Math.min(current.quantity, Math.floor(Number(receivedQty) || 0)));
  const received = current.quantity > 0 && qty >= current.quantity;
  await prisma.partRequest.update({
    where: { id },
    data: { receivedQty: qty, received, receivedAt: received ? new Date() : null },
  });
  revalidatePath(`/aeronefs/${current.aircraftId}`);
  revalidatePath(`/aeronefs/${current.aircraftId}/pieces`);
  return true;
}
