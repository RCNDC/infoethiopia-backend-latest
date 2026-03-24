CREATE TABLE IF NOT EXISTS `Job Applicants` (
  `Id` CHAR(36) NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `cvLink` VARCHAR(1000) DEFAULT NULL,
  `cvFileId` VARCHAR(255) DEFAULT NULL,
  `cvMessageId` VARCHAR(255) DEFAULT NULL,
  `jobPostId` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`Id`),
  KEY `idx_job_applicants_job_post` (`jobPostId`),
  UNIQUE KEY `uniq_job_applicant_per_job` (`jobPostId`, `email`),
  CONSTRAINT `fk_job_applicants_job_post`
    FOREIGN KEY (`jobPostId`) REFERENCES `Job Post` (`Id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_520_ci;
