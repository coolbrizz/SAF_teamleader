CREATE TABLE `AtaStatus` (
    `aircraftId` VARCHAR(191) NOT NULL,
    `ata` VARCHAR(191) NOT NULL,
    `done` BOOLEAN NOT NULL DEFAULT false,
    `doneAt` DATETIME(3) NULL,

    PRIMARY KEY (`aircraftId`, `ata`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `AtaStatus` ADD CONSTRAINT `AtaStatus_aircraftId_fkey` FOREIGN KEY (`aircraftId`) REFERENCES `Aircraft`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
