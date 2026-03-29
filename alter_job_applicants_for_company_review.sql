ALTER TABLE `Job Applicants`
  ADD COLUMN `currentCompany` VARCHAR(255) NULL AFTER `phone`,
  ADD COLUMN `employmentType` VARCHAR(30) NULL AFTER `currentCompany`,
  ADD COLUMN `workCountry` VARCHAR(120) NULL AFTER `employmentType`,
  ADD COLUMN `workCity` VARCHAR(120) NULL AFTER `workCountry`,
  ADD COLUMN `workMode` VARCHAR(30) NULL AFTER `workCity`,
  ADD COLUMN `workPeriod` VARCHAR(255) NULL AFTER `workMode`,
  ADD COLUMN `roleTitle` VARCHAR(255) NULL AFTER `workPeriod`,
  ADD COLUMN `education` LONGTEXT NULL AFTER `roleTitle`,
  ADD COLUMN `licensesAndCertifications` LONGTEXT NULL AFTER `education`,
  ADD COLUMN `skills` LONGTEXT NULL AFTER `licensesAndCertifications`,
  ADD COLUMN `applicationStatus` VARCHAR(30) NOT NULL DEFAULT 'submitted' AFTER `skills`,
  ADD COLUMN `reviewedAt` DATETIME NULL AFTER `applicationStatus`,
  ADD COLUMN `statusUpdatedAt` DATETIME NULL AFTER `reviewedAt`,
  ADD COLUMN `companyMessage` LONGTEXT NULL AFTER `statusUpdatedAt`,
  ADD COLUMN `lastEmailSubject` VARCHAR(255) NULL AFTER `companyMessage`,
  ADD COLUMN `lastEmailSentAt` DATETIME NULL AFTER `lastEmailSubject`,
  ADD COLUMN `archivedAt` DATETIME NULL AFTER `lastEmailSentAt`;

ALTER TABLE `Job Applicants`
  DROP COLUMN `cvLink`,
  DROP COLUMN `cvFileId`,
  DROP COLUMN `cvMessageId`;

ALTER TABLE `Job Applicants`
  ADD KEY `idx_job_applicants_status` (`applicationStatus`),
  ADD KEY `idx_job_applicants_archived_at` (`archivedAt`);
