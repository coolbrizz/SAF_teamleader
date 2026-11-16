-- AlterTable
ALTER TABLE `PartRequest` ADD COLUMN `boxNumber` VARCHAR(191) NULL;

-- Backfill from the mechanic's caisse
UPDATE `PartRequest` p
INNER JOIN `User` u ON u.`id` = p.`createdById`
SET p.`boxNumber` = u.`boxNumber`
WHERE p.`boxNumber` IS NULL AND u.`boxNumber` IS NOT NULL;
