import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const chefHash = await bcrypt.hash("Chef123!", 10);
  const mecaHash = await bcrypt.hash("Meca123!", 10);

  const chef = await prisma.user.upsert({
    where: { email: "chef@saf.local" },
    update: { role: "ADMIN" },
    create: {
      email: "chef@saf.local",
      passwordHash: chefHash,
      firstName: "Alex",
      lastName: "Dupont",
      trigramme: "ADU",
      role: "ADMIN",
    },
  });

  const meca = await prisma.user.upsert({
    where: { email: "meca@saf.local" },
    update: { boxNumber: "C-12" },
    create: {
      email: "meca@saf.local",
      passwordHash: mecaHash,
      firstName: "Jean",
      lastName: "Martin",
      trigramme: "JMA",
      boxNumber: "C-12",
      role: "MECANICIEN",
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
    where: {
      aircraftId_userId: { aircraftId: aircraft.id, userId: meca.id },
    },
    update: {},
    create: { aircraftId: aircraft.id, userId: meca.id },
  });

  console.log("Seed OK", { chef: chef.email, meca: meca.email, aircraft: aircraft.registration });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
