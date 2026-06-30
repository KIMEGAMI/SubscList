CREATE TABLE `CancellationChecklistItem` (
  `id` VARCHAR(191) NOT NULL,
  `subscriptionId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `CancellationChecklistItem_subscriptionId_sortOrder_idx`(`subscriptionId`, `sortOrder`),
  INDEX `CancellationChecklistItem_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CancellationEvidence` (
  `id` VARCHAR(191) NOT NULL,
  `subscriptionId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `kind` VARCHAR(191) NOT NULL,
  `referenceUrl` VARCHAR(191) NULL,
  `memo` TEXT NULL,
  `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `CancellationEvidence_subscriptionId_recordedAt_idx`(`subscriptionId`, `recordedAt`),
  INDEX `CancellationEvidence_userId_idx`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CancellationChecklistItem`
  ADD CONSTRAINT `CancellationChecklistItem_subscriptionId_fkey`
  FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CancellationChecklistItem`
  ADD CONSTRAINT `CancellationChecklistItem_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CancellationEvidence`
  ADD CONSTRAINT `CancellationEvidence_subscriptionId_fkey`
  FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CancellationEvidence`
  ADD CONSTRAINT `CancellationEvidence_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
