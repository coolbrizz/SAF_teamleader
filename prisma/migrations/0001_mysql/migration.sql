-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `trigramme` VARCHAR(191) NOT NULL,
    `boxNumber` VARCHAR(191) NULL,
    `role` ENUM('CHEF_VISITE', 'MECANICIEN', 'ADMIN') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_trigramme_key`(`trigramme`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aircraft` (
    `id` VARCHAR(191) NOT NULL,
    `machineNumber` VARCHAR(191) NOT NULL,
    `visitType` VARCHAR(191) NOT NULL,
    `registration` VARCHAR(191) NOT NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AircraftAssignment` (
    `aircraftId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`aircraftId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` VARCHAR(191) NOT NULL,
    `mechanicId` VARCHAR(191) NOT NULL,
    `aircraftId` VARCHAR(191) NULL,
    `boxNumber` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `observations` TEXT NOT NULL,
    `signature` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartRequest` (
    `id` VARCHAR(191) NOT NULL,
    `aircraftId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `pn` VARCHAR(191) NOT NULL,
    `taskKind` ENUM('TACHE', 'OE', 'TS') NOT NULL DEFAULT 'TACHE',
    `taskRef` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `ata` VARCHAR(191) NOT NULL,
    `daNumber` VARCHAR(191) NULL,
    `orderedAt` DATETIME(3) NULL,
    `received` BOOLEAN NOT NULL DEFAULT false,
    `receivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Remark` (
    `id` VARCHAR(191) NOT NULL,
    `aircraftId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `kind` ENUM('TACHE', 'CURA', 'TS', 'REMARQUE') NOT NULL,
    `reference` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `done` BOOLEAN NOT NULL DEFAULT false,
    `doneAt` DATETIME(3) NULL,
    `doneById` VARCHAR(191) NULL,
    `doneTrigramme` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AircraftAssignment` ADD CONSTRAINT `AircraftAssignment_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AircraftAssignment` ADD CONSTRAINT `AircraftAssignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_mechanicId_fkey` FOREIGN KEY (`mechanicId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartRequest` ADD CONSTRAINT `PartRequest_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartRequest` ADD CONSTRAINT `PartRequest_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remark` ADD CONSTRAINT `Remark_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remark` ADD CONSTRAINT `Remark_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remark` ADD CONSTRAINT `Remark_doneById_fkey` FOREIGN KEY (`doneById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
