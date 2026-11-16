-- Rename caisse column on parts to the part designation
ALTER TABLE `PartRequest` CHANGE `boxNumber` `designation` VARCHAR(191) NULL;

-- CURA joins the reference types. TACHE stays so existing rows still read.
ALTER TABLE `PartRequest` MODIFY `taskKind` ENUM('TACHE', 'OE', 'CURA', 'TS') NOT NULL DEFAULT 'OE';
