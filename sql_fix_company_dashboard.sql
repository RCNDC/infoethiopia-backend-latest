-- Run this in phpMyAdmin / MySQL for infoethiopianet_companyPortal
USE infoethiopianet_companyPortal;

CREATE TABLE IF NOT EXISTS `companyDashboard` (
  `Id` CHAR(36) COLLATE latin1_swedish_ci NOT NULL,
  `name` VARCHAR(255) COLLATE latin1_swedish_ci NOT NULL,
  `description` VARCHAR(1000) COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `email` VARCHAR(255) COLLATE latin1_swedish_ci NOT NULL,
  `password` VARCHAR(255) COLLATE latin1_swedish_ci NOT NULL,
  `logo` VARCHAR(255) COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Normalize current records so signin is reliable.
UPDATE `companyDashboard`
SET
  `email` = LOWER(TRIM(`email`)),
  `description` = IFNULL(`description`, ''),
  `logo` = IFNULL(`logo`, '');

ALTER TABLE `companyDashboard`
  MODIFY `Id` CHAR(36) COLLATE latin1_swedish_ci NOT NULL,
  MODIFY `name` VARCHAR(255) COLLATE latin1_swedish_ci NOT NULL,
  MODIFY `description` VARCHAR(1000) COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  MODIFY `email` VARCHAR(255) COLLATE latin1_swedish_ci NOT NULL,
  MODIFY `password` VARCHAR(255) COLLATE latin1_swedish_ci NOT NULL,
  MODIFY `logo` VARCHAR(255) COLLATE latin1_swedish_ci NOT NULL DEFAULT '',
  MODIFY `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  MODIFY `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add unique email index if it does not already exist.
SET @idx_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'companyDashboard'
    AND index_name = 'uq_companyDashboard_email'
);

SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE companyDashboard ADD UNIQUE KEY uq_companyDashboard_email (email)',
  'SELECT "uq_companyDashboard_email already exists"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check duplicates after normalization (should return 0 rows).
SELECT LOWER(TRIM(`email`)) AS normalized_email, COUNT(*) AS total
FROM `companyDashboard`
GROUP BY LOWER(TRIM(`email`))
HAVING COUNT(*) > 1;
