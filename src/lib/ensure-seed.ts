import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function ensureSeed() {
  const n = await prisma.user.count();
  if (n > 0) return;

  const chefHash = await bcrypt.hash("Chef123!", 10);
  const mecaHash = await bcrypt.hash("Meca123!", 10);

  const meca = await prisma.user.create({
    data: {
      email: "meca@saf.local",
      passwordHash: mecaHash,
      firstName: "Jean",
      lastName: "Martin",
      trigramme: "JMA",
      boxNumber: "C-12",
      role: "MECANICIEN",
    },
  });

  await prisma.user.create({
    data: {
      email: "chef@saf.local",
      passwordHash: chefHash,
      firstName: "Alex",
      lastName: "Dupont",
      trigramme: "ADU",
      role: "ADMIN",
    },
  });

  const aircraft = await prisma.aircraft.upsert({
    where: { id: "seed-h145-1" },
    update: {},
    create: {
      id: "seed-h145-1",
      machineNumber: "20123",
      visitType: "1000h",
      registration: "F-HSAF",
    },
  });

  await prisma.aircraftAssignment.upsert({
    where: { aircraftId_userId: { aircraftId: aircraft.id, userId: meca.id } },
    update: {},
    create: { aircraftId: aircraft.id, userId: meca.id },
  });
}
