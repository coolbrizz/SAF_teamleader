import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function ensureSeed() {
  const chef = await prisma.user.findUnique({
    where: { email: "chef@saf.local" },
  });
  if (!chef) {
    const chefHash = await bcrypt.hash("Chef123!", 10);
    await prisma.user.create({
      data: {
        email: "chef@saf.local",
        passwordHash: chefHash,
        firstName: "Alex",
        lastName: "Dupont",
        trigramme: "CHE",
        role: "ADMIN",
      },
    });
  }

  const meca = await prisma.user.findUnique({
    where: { email: "meca@saf.local" },
  });
  if (!meca) {
    const mecaHash = await bcrypt.hash("Meca123!", 10);
    await prisma.user.create({
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
  }

  await prisma.aircraft.upsert({
    where: { id: "seed-h145-1" },
    update: {},
    create: {
      id: "seed-h145-1",
      machineNumber: "20123",
      visitType: "1000h",
      registration: "F-HSAF",
    },
  });
}
