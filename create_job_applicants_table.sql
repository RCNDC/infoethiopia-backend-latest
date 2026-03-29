CREATE TABLE IF NOT EXISTS `Job Applicants` (
  `Id` CHAR(36) NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `currentCompany` VARCHAR(255) DEFAULT NULL,
  `employmentType` VARCHAR(30) DEFAULT NULL,
  `workCountry` VARCHAR(120) DEFAULT NULL,
  `workCity` VARCHAR(120) DEFAULT NULL,
  `workMode` VARCHAR(30) DEFAULT NULL,
  `workPeriod` VARCHAR(255) DEFAULT NULL,
  `roleTitle` VARCHAR(255) DEFAULT NULL,
  `education` LONGTEXT DEFAULT NULL,
  `licensesAndCertifications` LONGTEXT DEFAULT NULL,
  `skills` LONGTEXT DEFAULT NULL,
  `applicationStatus` VARCHAR(30) NOT NULL DEFAULT 'submitted',
  `reviewedAt` DATETIME DEFAULT NULL,
  `statusUpdatedAt` DATETIME DEFAULT NULL,
  `companyMessage` LONGTEXT DEFAULT NULL,
  `lastEmailSubject` VARCHAR(255) DEFAULT NULL,
  `lastEmailSentAt` DATETIME DEFAULT NULL,
  `archivedAt` DATETIME DEFAULT NULL,
  `jobPostId` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`Id`),
  KEY `idx_job_applicants_job_post` (`jobPostId`),
  KEY `idx_job_applicants_status` (`applicationStatus`),
  KEY `idx_job_applicants_archived_at` (`archivedAt`),
  UNIQUE KEY `uniq_job_applicant_per_job` (`jobPostId`, `email`),
  CONSTRAINT `fk_job_applicants_job_post`
    FOREIGN KEY (`jobPostId`) REFERENCES `Job Post` (`Id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_520_ci;
