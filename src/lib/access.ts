import { prisma } from "./prisma";
import type { SessionUser } from "./auth";
import { isChef } from "./auth";

export async function aircraftAccess(user: SessionUser, aircraftId: string) {
  if (isChef(user)) {
    return prisma.aircraft.findUnique({ where: { id: aircraftId } });
  }
  return prisma.aircraft.findFirst({
    where: {
      id: aircraftId,
      assignments: { some: { userId: user.id } },
    },
  });
}

export function mondayOf(d: Date) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() - day + 1);
  return x;
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
