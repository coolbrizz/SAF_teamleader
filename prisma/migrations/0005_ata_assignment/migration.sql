CREATE TABLE `AtaAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `aircraftId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `ata` VARCHAR(191) NOT NULL,
    `done` BOOLEAN NOT NULL DEFAULT false,
    `doneAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AtaAssignment_aircraftId_userId_ata_key`(`aircraftId`, `userId`, `ata`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `AtaAssignment` ADD CONSTRAINT `AtaAssignment_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AtaAssignment` ADD CONSTRAINT `AtaAssignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
