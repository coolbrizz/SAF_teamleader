ALTER TABLE `PartRequest` ADD COLUMN `receivedQty` INTEGER NOT NULL DEFAULT 0;
UPDATE `PartRequest` SET `receivedQty` = `quantity` WHERE `received` = 1;
